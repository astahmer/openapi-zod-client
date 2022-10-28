import { Children, ReactNode } from "react";
import type { BoxProps } from "./Box";
import { Box } from "./Box";

export const Flex = (props: BoxProps) => <Box display="flex" {...props} />;
export const VFlex = (props: BoxProps) => <Box display="flex" flexDirection="column" {...props} />;

type StackProps = Omit<BoxProps, "align"> & {
    children: ReactNode;
    space?: BoxProps["paddingBottom"];
};
// https://github.com/vanilla-extract-css/vanilla-extract/blob/98f8b0387d661b77705d2cd83ab3095434e1223e/site/src/system/Stack/Stack.tsx#L32
export const Stack = ({ children, space = 4, ...props }: StackProps) => {
    const stackItems = Children.toArray(children);
    const direction = props.flexDirection ?? "column";

    return (
        <Box display="flex" flexDirection={direction} {...props}>
            {stackItems.map((item, index) => (
                <Box
                    key={index}
                    pr={direction === "row" ? (index !== stackItems.length - 1 ? space : undefined) : undefined}
                    pb={direction === "column" ? (index !== stackItems.length - 1 ? space : undefined) : undefined}
                >
                    {item}
                </Box>
            ))}
        </Box>
    );
};

export const HStack = (props: StackProps) => <Stack flexDirection="row" {...props} />;

export const Center = (props: BoxProps) => (
    <Flex justifyContent="center" alignItems="center" textAlign="center" {...props} />
);
