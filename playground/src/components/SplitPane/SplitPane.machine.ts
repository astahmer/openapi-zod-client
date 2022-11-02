import React from "react";
import { assign, createMachine } from "xstate";
import { limit } from "pastable";

export type ResizablePanesContext = {
    resizerRef: HTMLDivElement;
    direction: "row" | "column";
    pointerX: number;
    pointerY: number;
    deltaX: number;
    deltaY: number;
    position: number;
    draggedSize: number;
    containerSize: number;
    minSize: number;
    maxSize: number | undefined;
    isPrimaryFirst: boolean;
    step: number;
};

type ResizablePanesEvent =
    | {
          type: "start";
          event: MouseEvent | React.MouseEvent;
          resizerRef: HTMLDivElement;
          direction: ResizablePanesContext["direction"];
      }
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
                direction: "row",
                pointerX: 0,
                pointerY: 0,
                deltaX: 0,
                deltaY: 0,
                position: 0,
                draggedSize: 0,
                containerSize: 0,
                minSize: 0,
                maxSize: undefined,
                isPrimaryFirst: true,
                step: 0,
            },
            initial: "idle",
            states: {
                idle: {
                    on: {
                        start: { target: "dragging", actions: "setInitialContext" },
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
                setInitialContext: assign({
                    position: (ctx, event) => (ctx.direction === "row" ? event.event.clientX : event.event.clientY),
                    containerSize: (ctx, event) => {
                        const container = event.resizerRef.parentElement;
                        if (!container) return ctx.containerSize;

                        return ctx.direction === "row"
                            ? container.getBoundingClientRect().width
                            : container.getBoundingClientRect().height;
                    },
                    resizerRef: (_ctx, event) => event.resizerRef,
                }),
                // adapted from https://github.dev/tomkp/react-split-pane/blob/master/src/SplitPane.js#L205
                assignContext: assign((ctx, event) => {
                    const paneResizer = ctx.resizerRef;
                    const position = ctx.position;

                    const isRow = ctx.direction === "row";
                    const containerSize = ctx.containerSize;
                    const paneResizerSize = isRow ? paneResizer.offsetWidth : paneResizer.offsetHeight;

                    const isPrimaryFirst = ctx.isPrimaryFirst ?? true;
                    const minSize = ctx.minSize ?? 0;
                    const step = ctx.step;
                    const maxSize = limit(ctx.maxSize ?? containerSize, [0, containerSize - paneResizerSize * 2]);

                    const node = isPrimaryFirst ? paneResizer.previousElementSibling! : paneResizer.nextElementSibling!;
                    const pointerEvent = event.event;

                    const current = isRow ? pointerEvent.clientX : pointerEvent.clientY;
                    const size = isRow ? node.getBoundingClientRect().width : node.getBoundingClientRect().height;

                    let positionDelta = position - current;
                    if (step) {
                        if (Math.abs(positionDelta) < step) {
                            return ctx;
                        }

                        // Integer division
                        positionDelta = Math.trunc(positionDelta / step) * step;
                    }

                    const sizeDelta = isPrimaryFirst ? positionDelta : -positionDelta;
                    const newSize = limit(size - sizeDelta, [minSize, maxSize]);
                    const newPosition = position - positionDelta;

                    if (ctx.direction === "row") {
                        const resizerWidth = paneResizer.offsetWidth ?? 0;

                        return {
                            ...ctx,
                            pointerX: pointerEvent.clientX - resizerWidth / 2,
                            pointerY: pointerEvent.clientY,
                            deltaX: pointerEvent.clientX - ctx.pointerX,
                            deltaY: pointerEvent.clientY - ctx.pointerY,
                            position: newPosition,
                            draggedSize: newSize,
                        };
                    }

                    const resizerHeight = paneResizer.offsetHeight ?? 0;
                    return {
                        ...ctx,
                        pointerX: pointerEvent.clientX,
                        pointerY: pointerEvent.clientY - resizerHeight / 2,
                        deltaX: pointerEvent.clientX - ctx.pointerX,
                        deltaY: pointerEvent.clientY - ctx.pointerY,
                        position: newPosition,
                        draggedSize: newSize,
                    };
                }),
            },
        }
    );
