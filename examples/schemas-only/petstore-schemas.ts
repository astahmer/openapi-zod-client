import { z } from "zod";

const Category = z.object({ id: z.number().int(), name: z.string() }).partial();
const Tag = z.object({ id: z.number().int(), name: z.string() }).partial();
const Pet = z.object({
    id: z.number().int().optional(),
    name: z.string(),
    category: Category.optional(),
    photoUrls: z.array(z.string()),
    tags: z.array(Tag).optional(),
    status: z.enum(["available", "pending", "sold"]).optional(),
});
const ApiResponse = z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial();
const Order = z
    .object({
        id: z.number().int(),
        petId: z.number().int(),
        quantity: z.number().int(),
        shipDate: z.string(),
        status: z.enum(["placed", "approved", "delivered"]),
        complete: z.boolean(),
    })
    .partial();
const User = z
    .object({
        id: z.number().int(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        password: z.string(),
        phone: z.string(),
        userStatus: z.number().int(),
    })
    .partial();
const Address = z.object({ street: z.string(), city: z.string(), state: z.string(), zip: z.string() }).partial();
const Customer = z.object({ id: z.number().int(), username: z.string(), address: z.array(Address) }).partial();

export const schemas = {
    Category,
    Tag,
    Pet,
    ApiResponse,
    Order,
    User,
    Address,
    Customer,
};
