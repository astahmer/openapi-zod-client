import path from "node:path";

import fs from "fs-extra";
import { compile } from "handlebars";
import type { OpenAPIObject, PathItemObject } from "openapi3-ts";
import { capitalize, pick, sortBy, sortListFromRefArray, sortObjKeysFromArray } from "pastable/server";
import type { Options } from "prettier";
import prettier from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { ts } from "tanu";
import { match } from "ts-pattern";

import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import type { EndpointDescriptionWithRefs } from "./getZodiosEndpointDefinitionFromOpenApiDoc";
import { getZodiosEndpointDefinitionFromOpenApiDoc } from "./getZodiosEndpointDefinitionFromOpenApiDoc";
import type { TsConversionContext } from "./openApiToTypescript";
import { getTypescriptFromOpenApi } from "./openApiToTypescript";
import { getZodSchema } from "./openApiToZod";
import { getRefFromName, getRefName, normalizeString } from "./tokens";
import { topologicalSort } from "./topologicalSort";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

// eslint-disable-next-line sonarjs/cognitive-complexity
export const getZodClientTemplateContext = (
    openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"],
    options?: TemplateContext["options"]
) => {
    const result = getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc, options);
    const data = makeTemplateContext();

    const docSchemas = openApiDoc.components?.schemas ?? {};
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(docSchemas).map((name) => getRefFromName(name)),
        result.getSchemaByRef
    );

    if (options?.shouldExportAllSchemas) {
        Object.entries(docSchemas).forEach(([name, schema]) => {
            if (!result.zodSchemaByName[name]) {
                result.zodSchemaByName[name] = getZodSchema({ schema, ctx: result }).toString();
            }
        });
    }

    const wrapWithLazyIfNeeded = (name: string) => {
        const [code, ref] = [result.zodSchemaByName[name], getRefFromName(name)];
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        if (isCircular) {
            data.circularTypeByName[name] = true;
        }

        return isCircular ? `z.lazy(() => ${code})` : code;
    };

    for (const name in result.zodSchemaByName) {
        data.schemas[name] = wrapWithLazyIfNeeded(name);
    }

    for (const ref in depsGraphs.deepDependencyGraph) {
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        const ctx: TsConversionContext = { nodeByRef: {}, getSchemaByRef: result.getSchemaByRef, visitedsRefs: {} };

        const refName = isCircular ? getRefName(ref) : undefined;
        if (isCircular && refName && !data.types[refName]) {
            const node = getTypescriptFromOpenApi({
                schema: result.getSchemaByRef(ref),
                ctx,
                meta: { name: refName },
            }) as ts.Node;
            data.types[refName] = printTs(node).replace("export ", "");

            for (const depRef of depsGraphs.deepDependencyGraph[ref] ?? []) {
                const depRefName = getRefName(depRef);
                const isDepCircular = depsGraphs.deepDependencyGraph[depRef]?.has(depRef);

                if (!isDepCircular && !data.types[depRefName]) {
                    const node = getTypescriptFromOpenApi({
                        schema: result.getSchemaByRef(depRef),
                        ctx,
                        meta: { name: depRefName },
                    }) as ts.Node;
                    data.types[depRefName] = printTs(node).replace("export ", "");
                }
            }
        }
    }

    const schemaOrderedByDependencies = topologicalSort(depsGraphs.refsDependencyGraph).map((ref) => getRefName(ref));
    data.schemas = sortObjKeysFromArray(data.schemas, schemaOrderedByDependencies);

    const groupStrategy = options?.groupStrategy ?? "none";
    const dependenciesByGroupName = new Map<string, Set<string>>();

    result.endpoints.forEach((endpoint) => {
        if (!endpoint.response) return;

        data.endpoints.push(endpoint);

        if (groupStrategy !== "none") {
            const operationPath = getOriginalPathWithBrackets(endpoint.path);
            const pathItemObject: PathItemObject = openApiDoc.paths[endpoint.path] ?? openApiDoc.paths[operationPath];
            if (!pathItemObject) {
                console.warn("Missing path", endpoint.path);
                return;
            }

            const operation = pathItemObject[endpoint.method]!;
            const baseName = match(groupStrategy)
                .with("tag", "tag-file", () => operation.tags?.[0] ?? "Default")
                .with("method", "method-file", () => endpoint.method)
                .exhaustive();
            const groupName = normalizeString(baseName);

            if (!data.endpointsGroups[groupName]) {
                data.endpointsGroups[groupName] = makeEndpointTemplateContext();
            }

            data.endpointsGroups[groupName].endpoints.push(endpoint);

            if (!dependenciesByGroupName.has(groupName)) {
                dependenciesByGroupName.set(groupName, new Set());
            }

            const dependencies = dependenciesByGroupName.get(groupName)!;

            const addDependencyIfNeeded = (schemaName: string) => {
                if (schemaName.startsWith("z.")) return;
                dependencies.add(schemaName);
            };

            addDependencyIfNeeded(endpoint.response);
            endpoint.parameters.forEach((param) => addDependencyIfNeeded(param.schema));
            endpoint.errors.forEach((param) => addDependencyIfNeeded(param.schema));
            dependencies.forEach(
                (ref) => (data.endpointsGroups[groupName].schemas[getRefName(ref)] = data.schemas[getRefName(ref)])
            );

            // reduce types/schemas for each group using prev computed deep dependencies
            if (groupStrategy.includes("file")) {
                [...dependencies].forEach((refName) => {
                    if (data.types[refName]) {
                        data.endpointsGroups[groupName].types[refName] = data.types[refName];
                    }

                    data.endpointsGroups[groupName].schemas[refName] = data.schemas[refName];

                    depsGraphs.deepDependencyGraph[getRefFromName(refName)]?.forEach((transitiveRef) => {
                        const transitiveRefName = getRefName(transitiveRef);
                        addDependencyIfNeeded(transitiveRefName);
                        data.endpointsGroups[groupName].types[transitiveRefName] = data.types[transitiveRefName];
                        data.endpointsGroups[groupName].schemas[transitiveRefName] = data.schemas[transitiveRefName];
                    });
                });
            }
        }
    });

    data.endpoints = sortBy(data.endpoints, "path");

    if (groupStrategy.includes("file")) {
        const dependenciesCount = new Map<string, number>();
        dependenciesByGroupName.forEach((deps) => {
            deps.forEach((dep) => {
                dependenciesCount.set(dep, (dependenciesCount.get(dep) ?? -1) + 1);
            });
        });

        const commonSchemaNames = new Set<string>();
        Object.keys(data.endpointsGroups).forEach((groupName) => {
            data.endpointsGroups[groupName].imports = {};

            const groupSchemas = {} as Record<string, string>;
            const groupTypes = {} as Record<string, string>;
            Object.entries(data.endpointsGroups[groupName].schemas).forEach(([name, schema]) => {
                const count = dependenciesCount.get(name) ?? 0;
                if (count > 1) {
                    data.endpointsGroups[groupName].imports![name] = "common";
                    commonSchemaNames.add(name);
                } else {
                    groupSchemas[name] = schema;

                    if (data.endpointsGroups[groupName].types[name]) {
                        groupTypes[name] = data.endpointsGroups[groupName].types[name];
                    }
                }
            });

            data.endpointsGroups[groupName].schemas = sortObjKeysFromArray(groupSchemas, schemaOrderedByDependencies);
            data.endpointsGroups[groupName].types = groupTypes;
        });
        data.commonSchemaNames = new Set(
            sortListFromRefArray(Array.from(commonSchemaNames), schemaOrderedByDependencies)
        );
    }

    return data;
};

type GenerateZodClientFromOpenApiArgs<TOptions extends TemplateContext["options"] = TemplateContext["options"]> = {
    openApiDoc: OpenAPIObject;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TOptions;
} & (
    | {
          distPath?: never;
          /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
          disableWriteToFile: true;
      }
    | { distPath: string; disableWriteToFile?: false }
);

export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext["options"]>({
    openApiDoc,
    distPath,
    templatePath,
    prettierConfig,
    options,
    disableWriteToFile,
}: GenerateZodClientFromOpenApiArgs<TOptions>): Promise<
    TOptions extends NonNullable<TemplateContext["options"]>
        ? undefined extends TOptions["groupStrategy"]
            ? string
            : TOptions["groupStrategy"] extends "none" | "tag" | "method"
            ? string
            : Record<string, string>
        : string
> => {
    const data = getZodClientTemplateContext(openApiDoc, options);
    const groupStrategy = options?.groupStrategy ?? "none";

    if (!templatePath) {
        templatePath = match(groupStrategy)
            .with("none", "tag-file", "method-file", () => path.join(__dirname, "../src/template.hbs"))
            .with("tag", "method", () => path.join(__dirname, "../src/template-grouped.hbs"))
            .exhaustive();
    }

    const source = await fs.readFile(templatePath, "utf8");
    const template = compile(source);
    const willWriteToFile = !disableWriteToFile && distPath;
    // TODO parallel writes ? does it really matter here ?

    if (groupStrategy.includes("file")) {
        const outputByGroupName: Record<string, string> = {};

        if (willWriteToFile) {
            await fs.ensureDir(distPath);
        }

        const groupNames = Object.fromEntries(
            Object.keys(data.endpointsGroups).map((groupName) => [
                options?.apiClientName ?? `${capitalize(groupName)}Api`,
                groupName,
            ])
        );

        const indexSource = await fs.readFile(path.join(__dirname, "../src/template-grouped-index.hbs"), "utf8");
        const indexTemplate = compile(indexSource);
        const indexOutput = maybePretty(indexTemplate({ groupNames }), prettierConfig);
        outputByGroupName["__index"] = indexOutput;

        if (willWriteToFile) {
            await fs.writeFile(path.join(distPath, "index.ts"), indexOutput);
        }

        const commonSource = await fs.readFile(path.join(__dirname, "../src/template-grouped-common.hbs"), "utf8");
        const commonTemplate = compile(commonSource);
        const commonSchemaNames = [...(data.commonSchemaNames ?? [])];
        const commonOutput = maybePretty(
            commonTemplate({
                schemas: pick(data.schemas, commonSchemaNames),
                types: pick(data.types, commonSchemaNames),
            }),
            prettierConfig
        );
        outputByGroupName["__common"] = commonOutput;

        if (willWriteToFile) {
            await fs.writeFile(path.join(distPath, "common.ts"), commonOutput);
        }

        for (const groupName in data.endpointsGroups) {
            const groupOutput = template({
                ...data,
                ...data.endpointsGroups[groupName],
                options: {
                    ...options,
                    groupStrategy: "none",
                    apiClientName: options?.apiClientName ?? `${capitalize(groupName)}Api`,
                },
            });
            const prettyGroupOutput = maybePretty(groupOutput, prettierConfig);
            outputByGroupName[groupName] = prettyGroupOutput;

            if (willWriteToFile) {
                console.log("Writing to", path.join(distPath, `${groupName}.ts`));
                await fs.writeFile(path.join(distPath, `${groupName}.ts`), prettyGroupOutput);
            }
        }

        return outputByGroupName as any;
    }

    const output = template({ ...data, options: { ...options, apiClientName: options?.apiClientName ?? "api" } });
    const prettyOutput = maybePretty(output, prettierConfig);

    if (willWriteToFile) {
        await fs.writeFile(distPath, prettyOutput);
    }

    return prettyOutput as any;
};

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
// eslint-disable-next-line import/no-unused-modules
export function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch {
        return input; // assume it's invalid syntax and ignore
    }
}

const makeEndpointTemplateContext = (): MinimalTemplateContext => {
    return { schemas: {}, endpoints: [], types: {} };
};

const makeTemplateContext = (): TemplateContext => {
    return {
        ...makeEndpointTemplateContext(),
        circularTypeByName: {},
        endpointsGroups: {},
        options: { withAlias: false, baseUrl: "" },
    };
};

type MinimalTemplateContext = Pick<TemplateContext, "endpoints" | "schemas" | "types"> & {
    imports?: Record<string, string>;
};

export type TemplateContext = {
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    endpointsGroups: Record<string, MinimalTemplateContext>;
    types: Record<string, string>;
    circularTypeByName: Record<string, true>;
    commonSchemaNames?: Set<string>;
    options?: {
        /** @see https://www.zodios.org/docs/client#baseurl */
        baseUrl?: string;
        /** @see https://www.zodios.org/docs/client#zodiosalias */
        withAlias?: boolean;
        /**
         * when using the default `template.hbs`, allow customizing the `export const {apiClientName}`
         *
         * @default "api"
         */
        apiClientName?: string;
        /**
         * when defined, will be used to pick which endpoint to use as the main one and set to `ZodiosEndpointDefinition["response"]`
         * will use `default` status code as fallback
         *
         * @see https://www.zodios.org/docs/api/api-definition#api-definition-structure
         *
         * works like `validateStatus` from axios
         * @see https://github.com/axios/axios#handling-errors
         *
         * @default `(status >= 200 && status < 300)`
         */
        isMainResponseStatus?: string | ((status: number) => boolean);
        /**
         * when defined, will be used to pick which endpoints should be included in the `ZodiosEndpointDefinition["errors"]` array
         * ignores `default` status
         *
         * @see https://www.zodios.org/docs/api/api-definition#errors
         *
         * works like `validateStatus` from axios
         * @see https://github.com/axios/axios#handling-errors
         *
         * @default `!(status >= 200 && status < 300)`
         */
        isErrorStatus?: string | ((status: number) => boolean);
        /**
         * when defined, will be used to pick the first MediaType found in (ResponseObject|RequestBodyObject)["content"] map matching the given expression
         *
         * context: some APIs returns multiple media types for the same response, this option allows you to pick which one to use
         * or allows you to define a custom media type to use like `application/json-ld` or `application/vnd.api+json`) etc...
         * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#response-object
         * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#media-types
         *
         * @default `mediaType === "application/json"`
         */
        isMediaTypeAllowed?: string | ((mediaType: string) => boolean);
        /** if OperationObject["description"] is not defined but the main ResponseObject["description"] is defined, use the latter as ZodiosEndpointDefinition["description"] */
        useMainResponseDescriptionAsEndpointDescriptionFallback?: boolean;
        /**
         * when true, will export all `#/components/schemas` even when not used in any PathItemObject
         * @see https://github.com/astahmer/openapi-zod-client/issues/19
         */
        shouldExportAllSchemas?: boolean;
        /**
         * when true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set
         * @see https://github.com/astahmer/openapi-zod-client/issues/23
         */
        withImplicitRequiredProps?: boolean;
        /**
         * when true, will keep deprecated endpoints in the api output
         * @default false
         */
        withDeprecatedEndpoints?: boolean;
        /**
         * groups endpoints by a given strategy
         *
         * when strategy is "tag" and multiple tags are defined for an endpoint, the first one will be used
         *
         * @default "none"
         */
        groupStrategy?: "none" | "tag" | "method" | "tag-file" | "method-file";
    };
};

const originalPathParam = /:(\w+)/g;
const getOriginalPathWithBrackets = (path: string) => path.replaceAll(originalPathParam, "{$1}");
