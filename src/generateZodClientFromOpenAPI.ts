import { compile } from "handlebars";
import fs from "fs-extra";
import path from "node:path";
import { OpenAPIObject, PathItemObject } from "openapi3-ts";
import { capitalize, sortBy, sortObjKeysFromArray } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { ts } from "tanu";
import { match } from "ts-pattern";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDefinitionFromOpenApiDoc,
} from "./getZodiosEndpointDefinitionFromOpenApiDoc";
import { getTypescriptFromOpenApi, TsConversionContext } from "./openApiToTypescript";
import { getZodSchema } from "./openApiToZod";
import { getRefFromName, getRefName, normalizeString } from "./tokens";
import { topologicalSort } from "./topologicalSort";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

export const getZodClientTemplateContext = (
    openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"],
    options?: TemplateContext["options"]
) => {
    const result = getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc, options);
    const data = makeTemplateContext();

    const docSchemas = openApiDoc.components?.schemas || {};
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(docSchemas).map((name) => getRefFromName(name)),
        result.getSchemaByRef
    );

    if (options?.shouldExportAllSchemas) {
        Object.entries(docSchemas).map(([name, schema]) => {
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

        const actualCode = isCircular ? `z.lazy(() => ${code})` : code;

        return actualCode;
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
                .with("tag", "tag-file", () => operation.tags?.[0] ?? "default")
                .with("method", "method-file", () => endpoint.method)
                .exhaustive();
            const groupName = normalizeString(baseName);

            if (!data.endpointsGroups[groupName]) {
                data.endpointsGroups[groupName] = makeEndpointTemplateContext();
            }
            data.endpointsGroups[groupName].endpoints.push(endpoint);

            const dependencies = new Set<string>();
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
                dependencies.forEach((refName) => {
                    if (data.types[refName]) {
                        data.endpointsGroups[groupName].types[refName] = data.types[refName];
                    }
                    data.endpointsGroups[groupName].schemas[refName] = data.schemas[refName];

                    depsGraphs.deepDependencyGraph[getRefFromName(refName)]?.forEach((transitiveRef) => {
                        const transitiveRefName = getRefName(transitiveRef);
                        data.endpointsGroups[groupName].types[transitiveRefName] = data.types[transitiveRefName];
                        data.endpointsGroups[groupName].schemas[transitiveRefName] = data.schemas[transitiveRefName];
                    });
                });
            }
        }
    });
    data.endpoints = sortBy(data.endpoints, "path");
    Object.keys(data.endpointsGroups).forEach((groupName) => {
        data.endpointsGroups[groupName].schemas = sortObjKeysFromArray(
            data.endpointsGroups[groupName].schemas,
            schemaOrderedByDependencies
        );
    });

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
    const source = await fs.readFile(templatePath, "utf-8");
    const template = compile(source);
    const willWriteToFile = !disableWriteToFile && distPath;

    if (groupStrategy.includes("file")) {
        const outputByGroupName: Record<string, string> = {};

        if (willWriteToFile) {
            await fs.ensureDir(distPath);
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

    const output = template({ ...data, options: { ...options, apiClientName: options?.apiClientName || "api" } });
    const prettyOutput = maybePretty(output, prettierConfig);

    if (willWriteToFile) {
        await fs.writeFile(distPath, prettyOutput);
    }

    return prettyOutput as any;
};

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
export function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch (e) {
        return input; // assume it's invalid syntax and ignore
    }
}

const makeEndpointTemplateContext = (): MinimalTemplateContext => {
    return { schemas: {}, endpoints: [], types: {}, circularTypeByName: {} };
};
const makeTemplateContext = (): TemplateContext => {
    return {
        ...makeEndpointTemplateContext(),
        endpointsGroups: {},
        options: { withAlias: false, baseUrl: "" },
    };
};

type MinimalTemplateContext = Pick<TemplateContext, "endpoints" | "schemas" | "types" | "circularTypeByName">;

export interface TemplateContext {
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    endpointsGroups: Record<string, MinimalTemplateContext>;
    types: Record<string, string>;
    circularTypeByName: Record<string, true>;
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
}

const originalPathParam = /:(\w+)/g;
const getOriginalPathWithBrackets = (path: string) => path.replaceAll(originalPathParam, "{$1}");
