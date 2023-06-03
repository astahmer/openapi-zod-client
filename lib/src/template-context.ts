import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts";
import { sortBy, sortListFromRefArray, sortObjKeysFromArray } from "pastable/server";
import { ts } from "tanu";
import { match } from "ts-pattern";

import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import type { EndpointDefinitionWithRefs } from "./getZodiosEndpointDefinitionList";
import { getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList";
import type { TsConversionContext } from "./openApiToTypescript";
import { getTypescriptFromOpenApi } from "./openApiToTypescript";
import { getZodSchema } from "./openApiToZod";
import { topologicalSort } from "./topologicalSort";
import { asComponentSchema, normalizeString } from "./utils";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

export const getZodClientTemplateContext = (
    openApiDoc: OpenAPIObject,
    options?: TemplateContext["options"]
    // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
    const result = getZodiosEndpointDefinitionList(openApiDoc, options);
    const data = makeTemplateContext();

    const docSchemas = openApiDoc.components?.schemas ?? {};
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(docSchemas).map((name) => asComponentSchema(name)),
        result.resolver.getSchemaByRef
    );

    if (options?.shouldExportAllSchemas) {
        Object.entries(docSchemas).forEach(([name, schema]) => {
            if (!result.zodSchemaByName[name]) {
                result.zodSchemaByName[name] = getZodSchema({ schema, ctx: result }).toString();
            }
        });
    }

    const wrapWithLazyIfNeeded = (schemaName: string) => {
        const [code, ref] = [result.zodSchemaByName[schemaName]!, result.resolver.resolveSchemaName(schemaName)?.ref];
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        if (isCircular) {
            data.circularTypeByName[schemaName] = true;
        }

        return isCircular ? `z.lazy(() => ${code})` : code;
    };

    for (const name in result.zodSchemaByName) {
        data.schemas[normalizeString(name)] = wrapWithLazyIfNeeded(name);
    }

    for (const ref in depsGraphs.deepDependencyGraph) {
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        const ctx: TsConversionContext = { nodeByRef: {}, resolver: result.resolver, visitedsRefs: {} };

        const schemaName = isCircular ? result.resolver.resolveRef(ref).normalized : undefined;
        if (isCircular && schemaName && !data.types[schemaName]) {
            const node = getTypescriptFromOpenApi({
                schema: result.resolver.getSchemaByRef(ref),
                ctx,
                meta: { name: schemaName },
            }) as ts.Node;
            data.types[schemaName] = printTs(node).replace("export ", "");

            for (const depRef of depsGraphs.deepDependencyGraph[ref] ?? []) {
                const depSchemaName = result.resolver.resolveRef(depRef).normalized;
                const isDepCircular = depsGraphs.deepDependencyGraph[depRef]?.has(depRef);

                if (!isDepCircular && !data.types[depSchemaName]) {
                    const node = getTypescriptFromOpenApi({
                        schema: result.resolver.getSchemaByRef(depRef),
                        ctx,
                        meta: { name: depSchemaName },
                    }) as ts.Node;
                    data.types[depSchemaName] = printTs(node).replace("export ", "");
                }
            }
        }
    }

    // TODO
    const schemaOrderedByDependencies = topologicalSort(depsGraphs.deepDependencyGraph).map(
        (ref) => result.resolver.resolveRef(ref).ref
    );
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

            const group = data.endpointsGroups[groupName]!;
            group.endpoints.push(endpoint);

            if (!dependenciesByGroupName.has(groupName)) {
                dependenciesByGroupName.set(groupName, new Set());
            }

            const dependencies = dependenciesByGroupName.get(groupName)!;

            const addDependencyIfNeeded = (schemaName: string) => {
                if (!schemaName) return;
                if (schemaName.startsWith("z.")) return;
                dependencies.add(schemaName);
            };

            addDependencyIfNeeded(endpoint.response);
            endpoint.parameters.forEach((param) => addDependencyIfNeeded(param.schema));
            endpoint.errors.forEach((param) => addDependencyIfNeeded(param.schema));
            dependencies.forEach((schemaName) => (group.schemas[schemaName] = data.schemas[schemaName]!));

            // reduce types/schemas for each group using prev computed deep dependencies
            if (groupStrategy.includes("file")) {
                [...dependencies].forEach((schemaName) => {
                    if (data.types[schemaName]) {
                        group.types[schemaName] = data.types[schemaName]!;
                    }

                    group.schemas[schemaName] = data.schemas[schemaName]!;
                    const ref = result.resolver.resolveSchemaName(schemaName)?.ref;
                    if (ref) {
                        depsGraphs.deepDependencyGraph[ref]?.forEach(
                            (transitiveRef) => {
                                const transitiveSchemaName = result.resolver.resolveRef(transitiveRef).normalized;
                                addDependencyIfNeeded(transitiveSchemaName);
                                group.types[transitiveSchemaName] = data.types[transitiveSchemaName]!;
                                group.schemas[transitiveSchemaName] = data.schemas[transitiveSchemaName]!;
                            }
                        );
                    }
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
            const group = data.endpointsGroups[groupName]!;
            group.imports = {};

            const groupSchemas = {} as Record<string, string>;
            const groupTypes = {} as Record<string, string>;
            Object.entries(group.schemas).forEach(([name, schema]) => {
                const count = dependenciesCount.get(name) ?? 0;
                if (count > 1) {
                    group.imports![name] = "common";
                    commonSchemaNames.add(name);
                } else {
                    groupSchemas[name] = schema;

                    if (group.types[name]) {
                        groupTypes[name] = group.types[name]!;
                    }
                }
            });

            group.schemas = sortObjKeysFromArray(groupSchemas, schemaOrderedByDependencies);
            group.types = groupTypes;
        });
        data.commonSchemaNames = new Set(
            sortListFromRefArray(Array.from(commonSchemaNames), schemaOrderedByDependencies)
        );
    }

    return data;
};

const makeEndpointTemplateContext = (): MinimalTemplateContext => ({ schemas: {}, endpoints: [], types: {} });

type MinimalTemplateContext = Pick<TemplateContext, "endpoints" | "schemas" | "types"> & {
    imports?: Record<string, string>;
};

const makeTemplateContext = (): TemplateContext => {
    return {
        ...makeEndpointTemplateContext(),
        circularTypeByName: {},
        endpointsGroups: {},
        options: { withAlias: false, baseUrl: "" },
    };
};

const originalPathParam = /:(\w+)/g;
const getOriginalPathWithBrackets = (path: string) => path.replaceAll(originalPathParam, "{$1}");

export type TemplateContext = {
    schemas: Record<string, string>;
    endpoints: EndpointDefinitionWithRefs[];
    endpointsGroups: Record<string, MinimalTemplateContext>;
    types: Record<string, string>;
    circularTypeByName: Record<string, true>;
    commonSchemaNames?: Set<string>;
    options?: TemplateContextOptions | undefined;
};

export type TemplateContextOptions = {
    /** @see https://www.zodios.org/docs/client#baseurl */
    baseUrl?: string;
    /**
     * When true, will either use the `operationId` as `alias`, or auto-generate it from the method and path.
     *
     * You can alternatively provide a custom function to generate the alias with the following signature:
     * `(path: string, method: string, operation: OperationObject) => string`
     * `OperationObject` is the OpenAPI operation object as defined in `openapi3-ts` npm package.
     * @see https://github.com/metadevpro/openapi3-ts/blob/master/src/model/OpenApi.ts#L110
     *
     * @see https://www.zodios.org/docs/client#zodiosalias
     * @default false
     */
    withAlias?: boolean | ((path: string, method: string, operation: OperationObject) => string);
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
     * when defined, will be used to pick the first MediaType found in ResponseObject["content"] map matching the given expression
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
    useMainResponseDescriptionAsEndpointDefinitionFallback?: boolean;
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
     * when true, will add the default values from the openapi schemas to the generated zod schemas
     *
     * @default true
     */
    withDefaultValues?: boolean;
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
    /**
     * schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable
     * tl;dr higher means more schemas will be inlined (rather than assigned to a variable)
     * ^ if you want to always inline schemas, set it to `-1` (special value) or a high value such as `1000`
     * v if you want to assign all schemas to a variable, set it to `0`
     *
     * @default 4
     */
    complexityThreshold?: number;
    /**
     * when defined as "auto-correct", will automatically use `default` as fallback for `response` when no status code was declared
     *
     * - if no main response has been found, this should be considered it as a fallback
     * - else this will be added as an error response
     *
     * @see https://github.com/astahmer/openapi-zod-client/pull/30#issuecomment-1280434068
     *
     * @default "spec-compliant"
     */
    defaultStatusBehavior?: "spec-compliant" | "auto-correct";
    willSuppressWarnings?: boolean;
    /**
     * when true, will add z.describe(xxx)
     * @see https://github.com/astahmer/openapi-zod-client/pull/143
     */
    withDescription?: boolean;
};
