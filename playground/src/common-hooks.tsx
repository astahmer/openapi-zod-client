import { ModalsProvider, SaasProvider } from "@saas-ui/react";
import type { CommonHooks } from "rakkasjs";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appTheme } from "./theme.cjs";
import { ToastContainer } from "./toasts.js";

const queryClient = new QueryClient();

const hooks: CommonHooks = {
    wrapApp: (app) => (
        <QueryClientProvider client={queryClient}>
            <SaasProvider theme={appTheme}>
                <ModalsProvider>{app}</ModalsProvider>
            </SaasProvider>
            <ToastContainer />
        </QueryClientProvider>
    ),
};

export default hooks;
