import path from "node:path";

import type { HelperOptions } from "handlebars";
import { create } from "handlebars";
import { capitalize, uncapitalize } from "pastable";

const partialDir = path.join(__dirname, "../src/templates/partials");

export const getHandlebars = async () => {
    const fs = await import("@liuli-util/fs-extra");
    const instance = create();

    instance.registerHelper("ifeq", function (a: string, b: string, options: HelperOptions) {
        if (a === b) {
            // @ts-expect-error
            return options.fn(this);
        }

        // @ts-expect-error
        return options.inverse(this);
    });
    instance.registerHelper("ifNotEmptyObj", function (obj: Record<string, any>, options: HelperOptions) {
        if (typeof obj === "object" && Object.keys(obj).length > 0) {
            // @ts-expect-error
            return options.fn(this);
        }

        // @ts-expect-error
        return options.inverse(this);
    });
    instance.registerHelper("camel-case", function (...args) {
        args.pop();

        return uncapitalize(args.shift()) + args.map(capitalize).join("");
    });

    for (const file of fs.readdirSync(partialDir)) {
        instance.registerPartial(path.basename(file, ".hbs"), await fs.readFile(path.join(partialDir, file), "utf8"));
    }

    return instance;
};
