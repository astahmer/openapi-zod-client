import { Stack } from "@chakra-ui/react";
import { Field, Form, FormLayout, FormProps } from "@saas-ui/react";
import { z } from "zod";

const schema = z.object({
    baseUrl: z.string().describe("Base URL"),
    withAlias: z.boolean(),
    apiClientName: z.string(),
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

export const OptionsForm = (props: FormProps<z.infer<typeof schema>>) => {
    return (
        <Form {...props}>
            <Stack spacing="4">
                <FormLayout columns={2}>
                    <Field name="baseUrl" label="Base URL" type="text" />
                    <Field name="apiClientName" type="text" label="API Client Name" />
                </FormLayout>
                <FormLayout columns={3}>
                    <Field name="withAlias" type="switch" label="With alias ?" />
                    <Field name="shouldExportAllSchemas" type="switch" label="Should export all Schemas" />
                    <Field name="withImplicitRequiredProps" type="switch" label="With implicit required props" />
                </FormLayout>
                <FormLayout columns={2}>
                    <Field
                        name="isMainResponseStatus"
                        type="text"
                        label="Is Main Response Status"
                        help="defaults to `(status >= 200 && status < 300)`"
                    />
                    <Field name="isErrorStatus" type="text" label="Is Error Status" />
                    <Field name="isMediaTypeAllowed" type="text" label="Is Media Type Allowed" />
                    <Field name="complexityThreshold" type="number" label="Complexity threshold" />
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
                    <Field
                        name="useMainResponseDescriptionAsEndpointDefinitionFallback"
                        type="switch"
                        label="Use main response.description as endpoint definition fallback ?"
                    />
                    <Field name="withDeprecatedEndpoints" type="switch" label="With deprecated endpoints" />
                </FormLayout>
            </Stack>
        </Form>
    );
};
