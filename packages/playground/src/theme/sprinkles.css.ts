import { createSprinkles } from "@vanilla-extract/sprinkles";

import { baseProperties } from "./base.css";
import { colorStyles } from "./colors.css";
// import { responsiveProperties } from "./responsive.css";
import { spacingStyles } from "./spacing.css";

export const sprinkles = createSprinkles(baseProperties, spacingStyles, colorStyles);
