import { compile } from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";
import { OpenAPIObject } from "openapi3-ts";
import { reverse, sortBy, sortObjectKeys, sortObjKeysFromArray } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { ts } from "tanu";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDefinitionFromOpenApiDoc,
} from "./getZodiosEndpointDefinitionFromOpenApiDoc";
import { getTypescriptFromOpenApi, TsConversionContext } from "./openApiToTypescript";
import { getZodSchema } from "./openApiToZod";
import { getRefName } from "./tokens";
import { topologicalSort } from "./topologicalSort";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

export const getZodClientTemplateContext = (
    openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"],
    options?: TemplateContext["options"]
) => {
    const result = getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc, options);
    const data = makeInitialContext();

    const docSchemas = openApiDoc.components?.schemas || {};
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(docSchemas).map((name) => `#/components/schemas/${name}`),
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
        const [code, ref] = [result.zodSchemaByName[name], `#/components/schemas/${name}`];
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

    result.endpoints.forEach((endpoint) => {
        if (!endpoint.response) return;
        data.endpoints.push({
            ...endpoint,
            parameters: endpoint.parameters.map((param) => ({ ...param, schema: param.schema })),
            response: endpoint.response,
            errors: endpoint.errors.map((error) => ({ ...error, schema: error.schema as any })) as any,
        });
    });
    data.endpoints = sortBy(data.endpoints, "path");

    return data;
};
type GenerateZodClientFromOpenApiArgs = {
    openApiDoc: OpenAPIObject;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TemplateContext["options"];
} & (
    | {
          distPath?: never;
          /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
          disableWriteToFile: true;
      }
    | { distPath: string; disableWriteToFile?: false }
);

export const generateZodClientFromOpenAPI = async ({
    openApiDoc,
    distPath,
    templatePath,
    prettierConfig,
    options,
    disableWriteToFile,
}: GenerateZodClientFromOpenApiArgs) => {
    const data = getZodClientTemplateContext(openApiDoc, options);

    if (!templatePath) {
        templatePath = path.join(__dirname, "../src/template.hbs");
    }
    const source = await fs.readFile(templatePath, "utf-8");
    const template = compile(source);

    const output = template({ ...data, options });
    const prettyOutput = maybePretty(output, prettierConfig);

    if (!disableWriteToFile && distPath) {
        await fs.writeFile(distPath, prettyOutput);
    }

    return prettyOutput;
};

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
export function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch (e) {
        return input; // assume it's invalid syntax and ignore
    }
}

const makeInitialContext = () =>
    ({
        variables: {},
        schemas: {},
        endpoints: [],
        types: {},
        circularTypeByName: {},
        options: {
            withAlias: false,
            baseUrl: "",
        },
    } as TemplateContext);

export interface TemplateContext {
    variables: Record<string, string>;
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    types: Record<string, string>;
    circularTypeByName: Record<string, true>;
    options?: {
        /** @see https://www.zodios.org/docs/client#baseurl */
        baseUrl?: string;
        /** @see https://www.zodios.org/docs/client#zodiosalias */
        withAlias?: boolean;
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
    };
}
