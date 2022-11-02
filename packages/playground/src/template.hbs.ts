export const baseOutputTemplate =
    "" +
    `import { makeApi, Zodios } from "@zodios/core";
import { z } from "zod";

{{#if imports}}
{{#each imports}}
import { {{{@key}}} } from "./{{{this}}}"
{{/each}}
{{/if}}


{{#if types}}
{{#each types}}
{{{this}}};
{{/each}}
{{/if}}

{{#each schemas}}
const {{@key}}{{#if (lookup ../circularTypeByName @key)}}: z.ZodType<{{@key}}>{{/if}} = {{{this}}};
{{/each}}

const endpoints = makeApi([
{{#each endpoints}}
	{
		method: "{{method}}",
		path: "{{path}}",
		{{#if @root.options.withAlias}}
		{{#if alias}}
		alias: "{{alias}}",
		{{/if}}
		{{/if}}
		{{#if description}}
		description: "{{description}}",
		{{/if}}
		{{#if requestFormat}}
		requestFormat: "{{requestFormat}}",
		{{/if}}
		{{#if parameters}}
		parameters: [
			{{#each parameters}}
			{
				name: "{{name}}",
				{{#if description}}
				description: "{{description}}",
				{{/if}}
				{{#if type}}
				type: "{{type}}",
				{{/if}}
				schema: {{{schema}}}
			},
			{{/each}}
		],
		{{/if}}
		response: {{{response}}},
		{{#if errors.length}}
		errors: [
			{{#each errors}}
			{
				{{#ifeq status "default" }}
				status: "default",
				{{else}}
				status: {{status}},
				{{/ifeq}}
				{{#if description}}
				description: "{{description}}",
				{{/if}}
				schema: {{{schema}}}
			},
			{{/each}}
		]
		{{/if}}
	},
{{/each}}
]);

export const {{options.apiClientName}} = new Zodios({{#if options.baseUrl}}"{{options.baseUrl}}", {{/if}}endpoints);
`;
