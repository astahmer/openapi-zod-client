import type { ReferenceObject, SchemaObject } from "openapi3-ts";

import { isReferenceObject } from "./isReferenceObject";
import { getSchemaComplexity } from "./schema-complexity";
import { getRefName } from "./utils";

export type ConversionTypeContext = {
    getSchemaByRef: ($ref: string) => SchemaObject;
    zodSchemaByName: Record<string, string>;
    schemaByName: Record<string, string>;
};

export type CodeMetaData = {
    isRequired?: boolean;
    name?: string;
    parent?: CodeMeta;
    referencedBy?: CodeMeta[];
};

type DefinedCodeMetaProps = "referencedBy";
type DefinedCodeMetaData = Pick<Required<CodeMetaData>, DefinedCodeMetaProps> &
    Omit<CodeMetaData, DefinedCodeMetaProps>;

export class CodeMeta {
    private code?: string;
    ref?: string;

    children: CodeMeta[] = [];
    meta: DefinedCodeMetaData;

    constructor(
        public schema: SchemaObject | ReferenceObject,
        public ctx?: ConversionTypeContext,
        meta: CodeMetaData = {}
    ) {
        if (isReferenceObject(schema)) {
            this.ref = schema.$ref;
        }

        // @ts-expect-error
        this.meta = { ...meta };
        this.meta.referencedBy = [...(meta?.referencedBy ?? [])];

        if (this.ref) {
            this.meta.referencedBy.push(this);
        }
    }

    get codeString(): string {
        if (this.code) return this.code;

        return getRefName(this.ref!);
    }

    get complexity(): number {
        return getSchemaComplexity({ current: 0, schema: this.schema });
    }

    assign(code: string) {
        this.code = code;

        return this;
    }

    inherit(parent?: CodeMeta) {
        if (parent) {
            parent.children.push(this);
        }

        return this;
    }

    toString() {
        return this.codeString;
    }
    toJSON() {
        return this.codeString;
    }
}
