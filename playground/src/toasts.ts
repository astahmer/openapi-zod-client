import type { ToastId, UseToastOptions } from "@chakra-ui/react";
import { createStandaloneToast } from "@chakra-ui/react";
import { getRandomString } from "pastable";

import theme from "./theme.cjs";

const { ToastContainer, toast } = createStandaloneToast({ theme });
export { ToastContainer };

const baseToastConfig: UseToastOptions & UniqueToastOptions = {
    duration: 1500,
    isClosable: true,
    unique: true,
    position: "bottom",
    containerStyle: { marginTop: "70px" },
};

type ToastStatus = Exclude<UseToastOptions["status"], undefined> | "default";
const toastConfigs: Record<ToastStatus, UseToastOptions> = {
    default: { ...baseToastConfig },
    success: { ...baseToastConfig, status: "success" },
    error: { ...baseToastConfig, status: "error" },
    info: { ...baseToastConfig, status: "info" },
    warning: { ...baseToastConfig, status: "warning" },
    loading: { ...baseToastConfig, status: "loading" },
};

const toastMap = new Map<ToastId, ToastOptions>();
export type ToastOptions = UseToastOptions & UniqueToastOptions;

function makeToast(title: string, options?: ToastOptions): ReturnType<typeof toast>;
function makeToast(options: ToastOptions): ReturnType<typeof toast>;
function makeToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof toast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };

    if (config.uniqueId) {
        config.id = getRandomString(10);
        const prevToast = toastMap.get(config.uniqueId);

        if (prevToast) {
            toast.close(prevToast.id!);
        }

        toastMap.set(config.uniqueId, config);
    } else if (config.unique) {
        toast.closeAll();
    }

    return toast(config);
}

function defaultToast(title: string, options?: ToastOptions): ReturnType<typeof makeToast>;
function defaultToast(options: ToastOptions): ReturnType<typeof makeToast>;
function defaultToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof makeToast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };
    return makeToast({ ...toastConfigs.default, ...config });
}

function successToast(title: string, options?: ToastOptions): ReturnType<typeof makeToast>;
function successToast(options: ToastOptions): ReturnType<typeof makeToast>;
function successToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof makeToast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };
    return makeToast({ ...toastConfigs.success, unique: false, ...config });
}

function errorToast(title: string, options?: ToastOptions): ReturnType<typeof makeToast>;
function errorToast(options: ToastOptions): ReturnType<typeof makeToast>;
function errorToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof makeToast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };
    return makeToast({ title: "Une erreur est survenue", ...toastConfigs.error, ...config });
}

function infoToast(title: string, options?: ToastOptions): ReturnType<typeof makeToast>;
function infoToast(options: ToastOptions): ReturnType<typeof makeToast>;
function infoToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof makeToast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };
    return makeToast({ ...toastConfigs.info, ...config });
}

function warningToast(title: string, options?: ToastOptions): ReturnType<typeof makeToast>;
function warningToast(options: ToastOptions): ReturnType<typeof makeToast>;
function warningToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): ReturnType<typeof makeToast> {
    const title = typeof titleOrOptions === "string" ? titleOrOptions : "";
    const config = (typeof titleOrOptions === "string" ? { ...options, title } : titleOrOptions) || { title };
    return makeToast({ ...toastConfigs.warning, ...config });
}

export const toasts = {
    close: toast.close,
    default: defaultToast,
    success: successToast,
    error: errorToast,
    info: infoToast,
    warning: warningToast,
};

type UniqueToastOptions = {
    /** When provided, will close previous toasts with the same id */
    uniqueId?: ToastId;
    /** When true, will close all other toasts */
    unique?: boolean;
};
