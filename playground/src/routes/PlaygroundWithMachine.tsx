import { useInterpret } from "@xstate/react";
import { Playground } from "./Playground";
import { playgroundMachine, PlaygroundMachineProvider } from "./Playground.machine";

export const PlaygroundWithMachine = () => {
    const service = useInterpret(playgroundMachine);

    return (
        <PlaygroundMachineProvider value={service}>
            <Playground />
        </PlaygroundMachineProvider>
    );
};
