import { Zodios } from "@zodios/core";
import { z } from "zod";

const hu8VM64CQw = z.object({ id: z.bigint(), name: z.string() }).partial().optional();
const KyXfnTjbWz = z
    .object({
        id: z.bigint().optional(),
        name: z.string(),
        category: hu8VM64CQw,
        photoUrls: z.array(z.string().optional()),
        tags: z.array(hu8VM64CQw).optional(),
        status: z.enum(["available", "pending", "sold"]).optional(),
    })
    .optional();
const lh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
const YUe5LGqDxm = z.array(KyXfnTjbWz).optional();
const lBJyXSdkxV = z.array(z.string().optional()).optional();
const oE4gkLXxTn = z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional();
const dqJo8eOFaZ = z
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
const dkmtDx9IhK = z
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
const HsMylbbc7I = z.array(dkmtDx9IhK).optional();

const variables = {
    ApiResponse: oE4gkLXxTn,
    Order: dqJo8eOFaZ,
    Pet: KyXfnTjbWz,
    User: dkmtDx9IhK,
    addPet: KyXfnTjbWz,
    addPet_Body: KyXfnTjbWz,
    createUser: dkmtDx9IhK,
    createUser_Body: dkmtDx9IhK,
    createUsersWithListInput: dkmtDx9IhK,
    createUsersWithListInput_Body: HsMylbbc7I,
    findPetsByStatus: YUe5LGqDxm,
    findPetsByTags: YUe5LGqDxm,
    getOrderById: dqJo8eOFaZ,
    getPetById: KyXfnTjbWz,
    getUserByName: dkmtDx9IhK,
    placeOrder: dqJo8eOFaZ,
    placeOrder_Body: dqJo8eOFaZ,
    status: lh4E1pXYTG,
    tags: lBJyXSdkxV,
    updatePet: KyXfnTjbWz,
    updatePet_Body: KyXfnTjbWz,
    updateUser_Body: dkmtDx9IhK,
    uploadFile: oE4gkLXxTn,
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
        response: z.array(variables["getPetById"]).optional(),
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
        response: z.array(variables["getPetById"]).optional(),
    },
    {
        method: "get",
        path: "/store/inventory",
        description: `Returns a map of status codes to quantities`,
        requestFormat: "json",
        response: z.record(z.bigint().optional()).optional(),
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
        response: z.string().optional(),
    },
] as const;

export const api = new Zodios("baseurl", endpoints);
