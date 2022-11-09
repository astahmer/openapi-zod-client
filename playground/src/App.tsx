import "uno.css";
import "../vite-plugin-react-click-to-component/client";

import { ModalsProvider, SaasProvider } from "@saas-ui/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appTheme } from "./theme.cjs";
import { ToastContainer } from "./toasts.js";
import { MainLayout } from "./routes/layout";
import { HomePage } from "./routes/index.page";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SaasProvider theme={appTheme}>
                <ModalsProvider>
                    <MainLayout>
                        <HomePage />
                    </MainLayout>
                </ModalsProvider>
            </SaasProvider>
            <ToastContainer />
        </QueryClientProvider>
    );
}

export default App;
