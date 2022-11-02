import { Box } from "@chakra-ui/react";
import { useInterpret } from "@xstate/react";
import { Children, CSSProperties, PropsWithChildren, useEffect, useRef } from "react";
import { resizablePanesMachine } from "./SplitPane.machine";

export function SplitPane({
    children,
    direction = "row",
    defaultSize,
}: PropsWithChildren<{ direction?: "row" | "column"; defaultSize?: CSSProperties["width"] }>) {
    const firstRef = useRef<HTMLDivElement>(null);
    const resizerRef = useRef<HTMLDivElement>(null);

    const service = useInterpret(
        () =>
            resizablePanesMachine.withContext({
                ...resizablePanesMachine.initialState.context,
                direction,
            }),
        undefined,
        (state) => {
            if (!state.changed) return;
            if (!firstRef.current) return;
            if (state.event.type !== "move") return;
            if (state.context.draggedSize === 0) return;

            if (direction === "row") {
                firstRef.current.style.setProperty("--size", `${state.context.draggedSize}px`);
            } else if (direction === "column") {
                firstRef.current.style.setProperty("--size", `${state.context.draggedSize}px`);
            }
        }
    );

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => service.send({ type: "move", event });
        const handleMouseUp = (event: MouseEvent) => service.send({ type: "stop", event });

        document.documentElement.addEventListener("mousemove", handleMouseMove);
        document.documentElement.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.documentElement.removeEventListener("mousemove", handleMouseMove);
            document.documentElement.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const [first, second] = Children.toArray(children);
    const isRow = direction === "row";
    const fallbackSize = defaultSize ?? "50%";

    return (
        <Box
            flex="1 1 0%"
            display="flex"
            flexDirection={isRow ? "row" : "column"}
            width="100%"
            height="100%"
            maxHeight="100%"
            userSelect="text"
            overflow="hidden"
        >
            <Box
                ref={(ref) => {
                    if (ref) {
                        // @ts-expect-error
                        firstRef.current = ref;
                        // @ts-expect-error
                        ref.style.setProperty("--size", fallbackSize);
                    }
                }}
                flex="0 0 auto"
                {...(isRow && { borderRight: "1px solid", borderRightColor: "blackAlpha.300" })}
                {...(!isRow && { borderBottom: "1px solid", borderBottomColor: "blackAlpha.300" })}
                style={
                    {
                        width: isRow ? `var(--size, ${fallbackSize})` : undefined,
                        height: !isRow ? `var(--size, ${fallbackSize})` : undefined,
                    } as any
                }
                data-pane
                data-pane-index="1"
            >
                {first}
            </Box>
            <Box
                ref={resizerRef}
                onMouseDown={(event) =>
                    service.send({ type: "start", event, resizerRef: resizerRef.current!, direction })
                }
                borderX={isRow ? "8px" : undefined}
                borderY={isRow ? undefined : "8px"}
                borderColor="blackAlpha.50"
                _hover={{ borderColor: "blackAlpha.300", cursor: isRow ? "col-resize" : "row-resize" }}
                role="presentation"
                userSelect="none"
                data-pane-resizer
                zIndex={1}
                minHeight={0}
            />
            <Box data-pane data-pane-index="2" position="relative" flex="1 1 0%" backgroundColor="white" height="100%">
                {second}
            </Box>
        </Box>
    );
}
