import { Zodios } from "@zodios/core";
import { z } from "zod";

const vhu8VM64CQw = z.object({ id: z.bigint(), name: z.string() }).partial().optional();
const vV4HVBDOhfv = z
    .object({
        id: z.bigint().optional(),
        name: z.string(),
        category: vhu8VM64CQw,
        photoUrls: z.array(z.string().optional()),
        tags: z.array(vhu8VM64CQw).optional(),
        status: z.enum(["available", "pending", "sold"]).optional(),
    })
    .optional();
const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
const vR4bF4K0wxQ = z.array(vV4HVBDOhfv);
const vlBJyXSdkxV = z.array(z.string().optional()).optional();
const voE4gkLXxTn = z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional();
const vdqJo8eOFaZ = z
    .object({
        id: z.bigint(),
        petId: z.bigint(),
        quantity: z.bigint(),
        shipDate: z.string(),
        status: z.enum(["placed", "approved", "delivered"]),
        complete: z.boolean(),
    })
    .partial()
    .optional();
const vdkmtDx9IhK = z
    .object({
        id: z.bigint(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        password: z.string(),
        phone: z.string(),
        userStatus: z.bigint(),
    })
    .partial()
    .optional();
const vGKbZVOSWPT = z.array(vdkmtDx9IhK);

const variables = {
    ApiResponse: voE4gkLXxTn,
    Order: vdqJo8eOFaZ,
    Pet: vV4HVBDOhfv,
    User: vdkmtDx9IhK,
    addPet: vV4HVBDOhfv,
    addPet_Body: vV4HVBDOhfv,
    createUser: vdkmtDx9IhK,
    createUser_Body: vdkmtDx9IhK,
    createUsersWithListInput: vdkmtDx9IhK,
    createUsersWithListInput_Body: vGKbZVOSWPT,
    findPetsByStatus: vR4bF4K0wxQ,
    findPetsByTags: vR4bF4K0wxQ,
    getOrderById: vdqJo8eOFaZ,
    getPetById: vV4HVBDOhfv,
    getUserByName: vdkmtDx9IhK,
    placeOrder: vdqJo8eOFaZ,
    placeOrder_Body: vdqJo8eOFaZ,
    status: vlh4E1pXYTG,
    tags: vlBJyXSdkxV,
    updatePet: vV4HVBDOhfv,
    updatePet_Body: vV4HVBDOhfv,
    updateUser_Body: vdkmtDx9IhK,
    uploadFile: voE4gkLXxTn,
};

const endpoints = [
    {
        method: "put",
        path: "/pet",
        description: `Update an existing pet by Id`,
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                description: `Update an existent pet in the store`,
                type: "Body",
                schema: variables["updatePet_Body"],
            },
        ],
        response: variables["Pet"],
    },
    {
        method: "post",
        path: "/pet",
        description: `Add a new pet to the store`,
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                description: `Create a new pet in the store`,
                type: "Body",
                schema: variables["addPet_Body"],
            },
        ],
        response: variables["Pet"],
    },
    {
        method: "get",
        path: "/pet/{petId}",
        description: `Returns a single pet`,
        requestFormat: "json",
        response: variables["Pet"],
    },
    {
        method: "post",
        path: "/pet/{petId}/uploadImage",
        requestFormat: "json",
        parameters: [
            {
                name: "additionalMetadata",
                type: "Query",
                schema: z.string().optional(),
            },
        ],
        response: variables["ApiResponse"],
    },
    {
        method: "get",
        path: "/pet/findByStatus",
        description: `Multiple status values can be provided with comma separated strings`,
        requestFormat: "json",
        parameters: [
            {
                name: "status",
                type: "Query",
                schema: variables["status"],
            },
        ],
        response: z.array(variables["getPetById"]),
    },
    {
        method: "get",
        path: "/pet/findByTags",
        description: `Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.`,
        requestFormat: "json",
        parameters: [
            {
                name: "tags",
                type: "Query",
                schema: variables["tags"],
            },
        ],
        response: z.array(variables["getPetById"]),
    },
    {
        method: "get",
        path: "/store/inventory",
        description: `Returns a map of status codes to quantities`,
        requestFormat: "json",
        response: z.record(z.bigint().optional()),
    },
    {
        method: "post",
        path: "/store/order",
        description: `Place a new order in the store`,
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: variables["placeOrder_Body"],
            },
        ],
        response: variables["Order"],
    },
    {
        method: "get",
        path: "/store/order/{orderId}",
        description: `For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.`,
        requestFormat: "json",
        response: variables["Order"],
    },
    {
        method: "get",
        path: "/user/{username}",
        requestFormat: "json",
        response: variables["User"],
    },
    {
        method: "post",
        path: "/user/createWithList",
        description: `Creates list of users with given input array`,
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: variables["createUsersWithListInput_Body"],
            },
        ],
        response: variables["User"],
    },
    {
        method: "get",
        path: "/user/login",
        requestFormat: "json",
        parameters: [
            {
                name: "username",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "password",
                type: "Query",
                schema: z.string().optional(),
            },
        ],
        response: z.string(),
    },
] as const;

export const api = new Zodios("baseurl", endpoints);
