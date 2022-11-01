import { Box } from "@chakra-ui/react";
import { useInterpret } from "@xstate/react";
import { Children, PropsWithChildren, useEffect, useRef } from "react";
import { resizablePanesMachine } from "./SplitPane.machine";

export function SplitPane({ children }: PropsWithChildren) {
    const firstPaneRef = useRef<HTMLDivElement>(null);
    const resizerRef = useRef<HTMLDivElement>(null);

    const service = useInterpret(() =>
        resizablePanesMachine.withContext({ ...resizablePanesMachine.initialState.context, resizerRef })
    );

    useEffect(() => {
        service.start().subscribe((state) => {
            if (!state.changed) return;
            if (firstPaneRef.current && state.context.pointerx !== 0) {
                firstPaneRef.current.style.setProperty("--size", `${state.context.pointerx}px`);
            }
        });
        return () => {
            service.stop();
        };
    }, [service]);

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

    return (
        <Box flex={1} display="flex" flexDirection="row" width="100%" height="100%" userSelect="text">
            <Box
                ref={firstPaneRef}
                minWidth="300px"
                maxWidth="calc(100% - 16px)"
                flex="0 0 auto"
                position="relative"
                style={{ "--size": "50%", width: "var(--size)" } as any}
                borderRight="1px"
                borderRightColor="blackAlpha.300"
                data-pane
                data-pane-index="1"
            >
                {first}
            </Box>
            <Box
                ref={resizerRef}
                onMouseDown={(event) => service.send({ type: "start", event })}
                borderX="8px"
                borderColor="blackAlpha.50"
                _hover={{ borderColor: "blackAlpha.300", cursor: "col-resize" }}
                role="presentation"
                userSelect="none"
                data-pane-resizer
            />
            <Box
                maxWidth="100%"
                width="100%"
                overflow="hidden"
                data-pane
                data-pane-index="2"
                // visibility="visible"
                // zIndex="base"
                // __flex="1 1 0% !important"
                // position="relative"
                // outline="none"
            >
                {second}
            </Box>
        </Box>
    );
}
