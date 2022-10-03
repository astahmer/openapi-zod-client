import { z } from "zod";

const vjRfEADnJZ8 = z.object({ street: z.string(), city: z.string(), state: z.string(), zip: z.string() }).partial();
const vR1x0k5qaLk = z.object({ id: z.number(), name: z.string() }).partial();
const v8JbFEq2fUl = z.object({
    id: z.number().optional(),
    name: z.string(),
    category: vR1x0k5qaLk.optional(),
    photoUrls: z.array(z.string()),
    tags: z.array(vR1x0k5qaLk).optional(),
    status: z.enum(["available", "pending", "sold"]).optional(),
});
const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
const vh4fxCvnN1b = z.array(v8JbFEq2fUl);
const vGqL1kemtHF = z.array(z.string()).optional();
const vBaxCoPHbgy = z.object({ code: z.number(), type: z.string(), message: z.string() }).partial();
const vLBYC40hXo1 = z
    .object({
        id: z.number(),
        petId: z.number(),
        quantity: z.number(),
        shipDate: z.string(),
        status: z.enum(["placed", "approved", "delivered"]),
        complete: z.boolean(),
    })
    .partial();
const veNKKR5W6KW = z
    .object({
        id: z.number(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        password: z.string(),
        phone: z.string(),
        userStatus: z.number(),
    })
    .partial();
const vVrSPZVa6q7 = z.array(veNKKR5W6KW);
const v0AfiYWQf6S = z.object({ id: z.number(), username: z.string(), address: z.array(vjRfEADnJZ8) }).partial();

export const schemas = {
    Address: vjRfEADnJZ8,
    ApiResponse: vBaxCoPHbgy,
    Category: vR1x0k5qaLk,
    Customer: v0AfiYWQf6S,
    Order: vLBYC40hXo1,
    Pet: v8JbFEq2fUl,
    Tag: vR1x0k5qaLk,
    User: veNKKR5W6KW,
    addPet: v8JbFEq2fUl,
    addPet_Body: v8JbFEq2fUl,
    createUser: veNKKR5W6KW,
    createUser_Body: veNKKR5W6KW,
    createUsersWithListInput: veNKKR5W6KW,
    createUsersWithListInput_Body: vVrSPZVa6q7,
    findPetsByStatus: vh4fxCvnN1b,
    findPetsByTags: vh4fxCvnN1b,
    getOrderById: vLBYC40hXo1,
    getPetById: v8JbFEq2fUl,
    getUserByName: veNKKR5W6KW,
    placeOrder: vLBYC40hXo1,
    placeOrder_Body: vLBYC40hXo1,
    status: vlh4E1pXYTG,
    tags: vGqL1kemtHF,
    updatePet: v8JbFEq2fUl,
    updatePet_Body: v8JbFEq2fUl,
    updateUser_Body: veNKKR5W6KW,
    uploadFile: vBaxCoPHbgy,
};
