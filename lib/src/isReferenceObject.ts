// taken from
// https://github.dev/metadevpro/openapi3-ts/blob/a62ff445207af599f591532ef776e671c456cc37/src/model/OpenApi.ts#L261-L269
// to avoid the runtime dependency on `openapi3-ts`
// which itself depends on `yaml` import (which use CJS `require` and thus can't be imported in a ESM module)

import type { ReferenceObject } from "openapi3-ts/oas31";

/**
 * A type guard to check if the given value is a `ReferenceObject`.
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
 *
 * @param obj The value to check.
 */
export function isReferenceObject(obj: any): obj is ReferenceObject {
    return obj != null && Object.prototype.hasOwnProperty.call(obj, "$ref");
}
