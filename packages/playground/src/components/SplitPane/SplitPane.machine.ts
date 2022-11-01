import React from "react";
import { assign, createMachine } from "xstate";

type ResizablePanesContext = {
    resizerRef: React.RefObject<HTMLDivElement>;
    direction: "horizontal" | "vertical";
    pointerx: number;
    pointery: number;
    dx: number;
    dy: number;
};

type ResizablePanesEvent =
    | { type: "start"; event: MouseEvent | React.MouseEvent }
    | { type: "move"; event: MouseEvent | React.MouseEvent }
    | { type: "stop"; event: MouseEvent | React.MouseEvent };

/** @see https://github.com/horacioh/resizable-panes */
export const resizablePanesMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QCc4EsBeBDARgGzAAIAHLAOzgDo0ICBiAWwHsBXWSJgdzMVGKdhoALmiY8kIAB6IAtACYA7ABZKSgBwBGAGxyAnLqUKAzFoVyANCACespVsq6jSwwt0KADBoMalAX1+WqILY+ESkFLCUEMhYUFBoZFCMrOzMAG5gvCD8giJiWdIIMhpy9rruTuWeRl4aljZFJXIOToZaStql7ob+geghBCTkVNGx8YnJbGAsxFk5wqLioIXyWmqUAKzOGgrGeloVSvWyGkZGLc7Guj41Chv+ASBkTBBwWUGYuIPhVDQEcwIFvkJCsjLp1uptBsjGpykZdm5jkUlOdSgpNGCtE4FF41L0QB8BmFhpFRnEElAAblFgUTkYNpQ1Gp0WoTO53Mo7kiZEZ3Bd1N0zKcPLotPjCV9iREosgmMRiJAqUCllJbHJzvC5Ho1FqtBtdOruRoSpQ0ZolNcfBiNOL+pKhhElXkVStLpRNdrdfrDdZZHJ3GVWso1DojKU8Q8gA */
    createMachine(
        {
            id: "resizable panes",
            predictableActionArguments: true,
            tsTypes: {} as import("./SplitPane.machine.typegen").Typegen0,
            schema: {
                context: {} as ResizablePanesContext,
                events: {} as ResizablePanesEvent,
            },
            context: {
                resizerRef: null as any,
                containerRef: null as any,
                direction: "horizontal",
                pointerx: 0,
                pointery: 0,
                dx: 0,
                dy: 0,
            },
            initial: "idle",
            states: {
                idle: {
                    on: {
                        start: { target: "dragging", actions: "assignContext" },
                    },
                },
                dragging: {
                    on: {
                        move: { actions: "assignContext" },
                        stop: { target: "idle", actions: "assignContext" },
                    },
                },
                dropped: {},
            },
        },
        {
            actions: {
                assignContext: assign((context, event) => {
                    const paneResizer = context.resizerRef.current!;
                    const resizerWidth = paneResizer.offsetWidth ?? 0;
                    const pointerEvent = event.event;

                    return {
                        pointerx: pointerEvent.clientX - resizerWidth / 2,
                        pointery: pointerEvent.clientY,
                        dx: pointerEvent.clientX - context.pointerx,
                        dy: pointerEvent.clientY - context.pointery,
                    };
                }),
            },
        }
    );
