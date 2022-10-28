import { defineProperties } from "@vanilla-extract/sprinkles";
import type { NonUndefined } from "pastable";
import type tb from "ts-toolbelt";
import { theme } from "./vars.css";

const colors = theme.colors;
const flatColors = flatMapColorsWithVariants(colors);

export const colorStyles = defineProperties({
    conditions: {
        lightMode: {},
        darkMode: { "@media": "(prefers-color-scheme: dark)" },
        focus: { selector: "&:focus" },
        hover: { selector: "&:hover" },
    },
    defaultCondition: "lightMode",
    properties: {
        color: flatColors,
        background: flatColors,
        backgroundColor: flatColors,
        borderColor: flatColors,
        borderTopColor: flatColors,
        borderBottomColor: flatColors,
        borderLeftColor: flatColors,
        borderRightColor: flatColors,
    },
    shorthands: {
        bg: ["background"],
        bgColor: ["backgroundColor"],
    },
});

type ChakraThemeColors = typeof colors;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type PossibleThemeColorKey = SimpleColors | PossibleColorWithVariants;

type AppThemeColorMap = {
    [P in keyof ChakraThemeColors[keyof ChakraThemeColors] as PossibleThemeColorKey]: string;
};

type SimpleColors = NonObjectKeys<ChakraThemeColors>;
type ColorsWithVariants = NonStringKeys<ChakraThemeColors>;

type ColorsMapWithTheirVariants = {
    [Prop in ColorsWithVariants]: Exclude<tb.Any.KnownKeys<ChakraThemeColors[Prop]>, "DEFAULT">;
};
type ColorsMapWithTheirVariantsAndDefault = {
    [Color in tb.Any.Keys<ColorsMapWithTheirVariants>]: `${Color}.${ColorsMapWithTheirVariants[Color]}` | Color;
};
type PossibleColorWithVariants = tb.Object.UnionOf<ColorsMapWithTheirVariantsAndDefault>;

// Inspired by https://github.com/kesne/vanilla-tailwind/blob/main/src/theme.css.ts
function chakraColorVariantsToRecordOfAppThemeColorKeys<T extends keyof ColorsMapWithTheirVariantsAndDefault>(name: T) {
    return Object.fromEntries(
        Object.entries(colors[name]).map(([num, value]) => [num === "DEFAULT" ? name : `${name}.${num}`, value])
    ) as Record<T, ColorsMapWithTheirVariantsAndDefault[T]>;
}

function flatMapColorsWithVariants(themeColors: ChakraThemeColors) {
    const themeMap = {} as AppThemeColorMap;

    let key: keyof typeof themeColors;
    for (key in themeColors) {
        if (typeof themeColors[key] === "string") {
            themeMap[key] = (themeColors[key] as string) + " !important";
        } else {
            const colorMap = chakraColorVariantsToRecordOfAppThemeColorKeys(
                key as keyof ColorsMapWithTheirVariantsAndDefault
            );
            let colorVariant: ColorsWithVariants;
            for (colorVariant in colorMap) {
                themeMap[colorVariant] = colorMap[colorVariant] + " !important";
            }
        }
    }

    return themeMap;
}

type NonObjectKeys<T extends object> = {
    [K in keyof T]-?: NonUndefined<T[K]> extends object ? never : K;
}[keyof T];
type NonStringKeys<T extends object> = {
    [K in keyof T]-?: NonUndefined<T[K]> extends string ? never : K;
}[keyof T];
