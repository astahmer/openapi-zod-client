import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/status/",
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
  },
]);

export const StatusApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
