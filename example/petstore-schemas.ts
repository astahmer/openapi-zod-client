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

export const schemas = {
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
