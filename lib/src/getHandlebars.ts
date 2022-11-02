import type { HelperOptions } from "handlebars";
import { create } from "handlebars";

export const getHandlebars = () => {
    const instance = create();
    instance.registerHelper("ifeq", function (a: string, b: string, options: HelperOptions) {
        if (a === b) {
            // @ts-expect-error
            return options.fn(this);
        }

        // @ts-expect-error
        return options.inverse(this);
    });

    return instance;
};
