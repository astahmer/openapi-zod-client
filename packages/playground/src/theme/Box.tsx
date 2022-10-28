import { createBox } from "@dessert-box/react";
import type { ComponentProps } from "react";

import { sprinkles } from "./sprinkles.css";

export const Box = createBox({ atoms: sprinkles });
export type BoxProps = ComponentProps<typeof Box>;
