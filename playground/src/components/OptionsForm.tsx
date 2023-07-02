import { Stack } from "@chakra-ui/react";
import { Field, Form, FormLayout, FormProps } from "@saas-ui/react";
import { z } from "zod";

const schema = z.object({
    baseUrl: z.string(),
    withAlias: z.boolean(),
    apiClientName: z.string().default("api"),
    isMainResponseStatus: z.string(),
    isErrorStatus: z.string(),
    isMediaTypeAllowed: z.string(),
    useMainResponseDescriptionAsEndpointDefinitionFallback: z.boolean(),
    shouldExportAllSchemas: z.boolean(),
    withImplicitRequiredProps: z.boolean(),
    withDeprecatedEndpoints: z.boolean(),
    groupStrategy: z.enum(["none", "tag", "method", "tag-file", "method-file"]).default("none"),
    complexityThreshold: z.number().default(4),
    defaultStatusBehavior: z.enum(["spec-compliant", "auto-correct"]).default("spec-compliant"),
});
export type OptionsFormValues = z.infer<typeof schema>;

export const defaultOptionValues = {
    baseUrl: "",
    withAlias: true,
    apiClientName: "api",
    isMainResponseStatus: "status >= 200 && status < 300",
    isErrorStatus: "!(status >= 200 && status < 300)",
    isMediaTypeAllowed: "mediaType === 'application/json'",
    useMainResponseDescriptionAsEndpointDefinitionFallback: false,
    shouldExportAllSchemas: false,
    withImplicitRequiredProps: false,
    withDeprecatedEndpoints: false,
    groupStrategy: "none",
    complexityThreshold: 4,
    defaultStatusBehavior: "spec-compliant",
} as const satisfies OptionsFormValues;

export const OptionsForm = (props: FormProps<OptionsFormValues>) => {
    return (
        <Form defaultValues={defaultOptionValues} {...props}>
            <Stack spacing="4">
                <Field name="baseUrl" label="Base URL" type="text" help="https://petstore.swagger.io/v2" />
                <FormLayout columns={2}>
                    <Field name="apiClientName" type="text" label="API Client Name" />
                    <Field
                        type="select"
                        name="booleans"
                        label="Booleans options"
                        options={[
                            { label: "With alias ?", value: "withAlias" },
                            { label: "Should export all schemas ?", value: "shouldExportAllSchemas" },
                            { label: "With implicit required props ?", value: "withImplicitRequiredProps" },
                            { label: "With deprecated endpoints ?", value: "withDeprecatedEndpoints" },
                            {
                                label: "Use main response.description as endpoint definition fallback ?",
                                value: "useMainResponseDescriptionAsEndpointDefinitionFallback",
                            },
                        ] satisfies Array<{ label: string; value: keyof OptionsFormValues }>}
                        defaultValue={[]}
                        multiple
                    />
                    <Field
                        name="groupStrategy"
                        type="select"
                        options={[
                            { label: "None", value: "none" },
                            { label: "Tag", value: "tag" },
                            { label: "Method", value: "method" },
                            { label: "Tag split by file", value: "tag-file" },
                            { label: "Method split by file", value: "method-file" },
                        ]}
                        label="Group strategy"
                    />
                    <Field
                        name="defaultStatusBehavior"
                        type="select"
                        options={[
                            { label: "Spec compliant", value: "spec-compliant" },
                            { label: "Auto correct", value: "auto-correct" },
                        ]}
                        label="Default status behavior"
                    />
                </FormLayout>
                <FormLayout columns={2}>
                    <Field name="isMainResponseStatus" type="text" label="Is Main Response Status" />
                    <Field name="isErrorStatus" type="text" label="Is Error Status" />
                    <Field name="isMediaTypeAllowed" type="text" label="Is Media Type Allowed" />
                    <Field name="complexityThreshold" type="number" label="Complexity threshold" />
                </FormLayout>
            </Stack>
        </Form>
    );
};
