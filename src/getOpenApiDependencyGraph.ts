import { isReferenceObject, ReferenceObject, SchemaObject } from "openapi3-ts";

export const getOpenApiDependencyGraph = (
    schemaRef: string[],
    getSchemaByRef: (ref: string) => SchemaObject | ReferenceObject
) => {
    const visitedsRefs = {} as Record<string, boolean>;
    const refsDependencyGraph = {} as Record<string, Set<string>>;

    const visit = (schema: SchemaObject | ReferenceObject, fromRef: string): void => {
        if (!schema) return;

        if (isReferenceObject(schema)) {
            if (!refsDependencyGraph[fromRef]) {
                refsDependencyGraph[fromRef] = new Set();
            }
            refsDependencyGraph[fromRef].add(schema.$ref);

            if (visitedsRefs[schema.$ref]) return;

            visitedsRefs[fromRef] = true;
            visit(getSchemaByRef(schema.$ref), schema.$ref);
            return;
        }

        if (schema.type === "array") {
            if (!schema.items) return;
            return visit(schema.items, fromRef);
        }

        if (schema.type === "object") {
            for (const property in schema.properties) {
                visit(schema.properties[property], fromRef);
            }
            return;
        }

        if (schema.allOf) {
            for (const allOf of schema.allOf) {
                visit(allOf, fromRef);
            }
            return;
        }

        if (schema.oneOf) {
            for (const oneOf of schema.oneOf) {
                visit(oneOf, fromRef);
            }
            return;
        }

        if (schema.anyOf) {
            for (const anyOf of schema.anyOf) {
                visit(anyOf, fromRef);
            }
            return;
        }
    };

    schemaRef.forEach((ref) => visit(getSchemaByRef(ref), ref));

    const deepDependencyGraph = {} as Record<string, Set<string>>;
    const visitedsDeepRefs = {} as Record<string, boolean>;
    schemaRef.forEach((ref) => {
        const deps = refsDependencyGraph[ref];
        if (!deps) return;
        if (!deepDependencyGraph[ref]) {
            deepDependencyGraph[ref] = new Set();
        }

        const visit = (dep: string) => {
            deepDependencyGraph[ref].add(dep);
            if (refsDependencyGraph[dep] && ref !== dep) {
                refsDependencyGraph[dep].forEach((transitive) => {
                    if (visitedsDeepRefs[ref + "__" + transitive]) return;
                    visitedsDeepRefs[ref + "__" + transitive] = true;
                    visit(transitive);
                });
            }
        };
        deps.forEach((dep) => visit(dep));
    });

    return { refsDependencyGraph, deepDependencyGraph };
};
