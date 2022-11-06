declare module "whence" {
    export default function whence<T>(
        input: T,
        context: Record<string, string | number | boolean>,
        options?: { functions: boolean }
    ): boolean;
    export function sync<T>(
        input: T,
        context: Record<string, string | number | boolean>,
        options?: { functions: boolean }
    ): boolean;
}
