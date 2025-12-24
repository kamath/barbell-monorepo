import type { InputBlock } from "./blocks";

/**
 * JSON Schema property definition
 */
type JSONSchemaProperty = {
	type?: string | string[];
	format?: string;
	enum?: unknown[];
	default?: unknown;
	description?: string;
	title?: string;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	items?: JSONSchemaProperty;
	properties?: Record<string, JSONSchemaProperty>;
	required?: string[];
};

/**
 * JSON Schema object (from z.toJSONSchema())
 * Accepts the actual return type from Zod's toJSONSchema()
 */
type JSONSchema = {
	type?:
		| "string"
		| "number"
		| "boolean"
		| "object"
		| "null"
		| "array"
		| "integer"
		| string
		| string[];
	properties?: Record<string, JSONSchemaProperty>;
	required?: string[];
	[key: string]: unknown;
};

/**
 * Options for customizing the conversion
 */
export interface JsonSchemaToInputBlocksOptions {
	/**
	 * Custom format handlers. Override default behavior for specific formats.
	 */
	formatOverrides?: Record<
		string,
		(
			property: JSONSchemaProperty,
			key: string,
			isRequired: boolean,
		) => InputBlock
	>;
	/**
	 * Handler for unknown formats. If not provided, falls back to plain_text_input.
	 */
	unknownFormatHandler?: (
		format: string,
		property: JSONSchemaProperty,
		key: string,
		isRequired: boolean,
	) => InputBlock;
}

/**
 * Convert a snake_case or camelCase key to Title Case
 */
function toTitleCase(key: string): string {
	return key
		.replace(/([A-Z])/g, " $1")
		.replace(/[_-]/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ")
		.trim();
}

/**
 * Get placeholder text for a format
 */
function getFormatPlaceholder(format: string): string {
	const placeholders: Record<string, string> = {
		uuid: "e.g., 550e8400-e29b-41d4-a716-446655440000",
		ipv4: "e.g., 192.168.1.1",
		ipv6: "e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334",
		jwt: "e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		cuid: "e.g., cl9ebqhxk00003b600tymydho",
		cuid2: "e.g., cl9ebqhxk00003b600tymydho",
		nanoid: "e.g., V1StGXR8_Z5jdHi6B-myT",
		ulid: "e.g., 01ARZ3NDEKTSV4RRFFQ69G5FAV",
	};
	return placeholders[format] || `Enter ${format}`;
}

/**
 * Create a plain text input block
 */
function createPlainTextInput(
	key: string,
	property: JSONSchemaProperty,
	isRequired: boolean,
	multiline = false,
): InputBlock {
	const element: InputBlock["element"] = {
		type: "plain_text_input",
		action_id: key,
		multiline,
	};

	if (property.description) {
		element.placeholder = {
			type: "plain_text",
			text: property.description,
		};
	}

	if (property.default !== undefined) {
		element.initial_value = String(property.default);
	}

	return {
		type: "input",
		block_id: key,
		element,
		label: {
			type: "plain_text",
			text: property.title || toTitleCase(key),
		},
		optional: !isRequired,
	};
}

/**
 * Convert a JSON Schema property to a Slack InputBlock
 */
function propertyToInputBlock(
	key: string,
	property: JSONSchemaProperty,
	isRequired: boolean,
	options: JsonSchemaToInputBlocksOptions = {},
): InputBlock {
	// Handle enum (static select)
	if (property.enum && Array.isArray(property.enum)) {
		const options_list = property.enum.map((value) => ({
			text: {
				type: "plain_text" as const,
				text: String(value),
			},
			value: String(value),
		}));

		return {
			type: "input",
			block_id: key,
			element: {
				type: "static_select",
				action_id: key,
				options: options_list,
				placeholder: {
					type: "plain_text",
					text: property.description || `Select ${toTitleCase(key)}`,
				},
				...(property.default !== undefined && {
					initial_option: options_list.find(
						(opt) => opt.value === String(property.default),
					),
				}),
			},
			label: {
				type: "plain_text",
				text: property.title || toTitleCase(key),
			},
			optional: !isRequired,
		};
	}

	// Handle array with enum items (multi-select)
	if (
		property.type === "array" &&
		property.items &&
		property.items.enum &&
		Array.isArray(property.items.enum)
	) {
		const options_list = property.items.enum.map((value) => ({
			text: {
				type: "plain_text" as const,
				text: String(value),
			},
			value: String(value),
		}));

		return {
			type: "input",
			block_id: key,
			element: {
				type: "multi_static_select",
				action_id: key,
				options: options_list,
				placeholder: {
					type: "plain_text",
					text: property.description || `Select ${toTitleCase(key)}`,
				},
			},
			label: {
				type: "plain_text",
				text: property.title || toTitleCase(key),
			},
			optional: !isRequired,
		};
	}

	// Handle nested objects (JSON fallback)
	if (property.type === "object" || property.properties) {
		return createPlainTextInput(key, property, isRequired, true);
	}

	// Handle format-specific types
	if (property.format) {
		// Check for custom override first
		if (options.formatOverrides?.[property.format]) {
			return options.formatOverrides[property.format](
				property,
				key,
				isRequired,
			);
		}

		// Built-in format handlers
		switch (property.format) {
			case "email": {
				const element: InputBlock["element"] = {
					type: "plain_text_input",
					action_id: key,
				};
				if (property.default !== undefined) {
					element.initial_value = String(property.default);
				}
				return {
					type: "input",
					block_id: key,
					element,
					label: {
						type: "plain_text",
						text: property.title || toTitleCase(key),
					},
					optional: !isRequired,
				};
			}

			case "uri":
			case "url": {
				const element: InputBlock["element"] = {
					type: "plain_text_input",
					action_id: key,
				};
				if (property.default !== undefined) {
					element.initial_value = String(property.default);
				}
				return {
					type: "input",
					block_id: key,
					element,
					label: {
						type: "plain_text",
						text: property.title || toTitleCase(key),
					},
					optional: !isRequired,
				};
			}

			case "date": {
				const element: InputBlock["element"] = {
					type: "datepicker",
					action_id: key,
				};
				if (property.default !== undefined) {
					element.initial_date = String(property.default);
				}
				return {
					type: "input",
					block_id: key,
					element,
					label: {
						type: "plain_text",
						text: property.title || toTitleCase(key),
					},
					optional: !isRequired,
				};
			}

			case "time": {
				const element: InputBlock["element"] = {
					type: "timepicker",
					action_id: key,
				};
				if (property.default !== undefined) {
					element.initial_time = String(property.default);
				}
				return {
					type: "input",
					block_id: key,
					element,
					label: {
						type: "plain_text",
						text: property.title || toTitleCase(key),
					},
					optional: !isRequired,
				};
			}

			case "date-time": {
				const element: InputBlock["element"] = {
					type: "datetimepicker",
					action_id: key,
				};
				if (property.default !== undefined) {
					element.initial_date_time = Number(property.default);
				}
				return {
					type: "input",
					block_id: key,
					element,
					label: {
						type: "plain_text",
						text: property.title || toTitleCase(key),
					},
					optional: !isRequired,
				};
			}

			case "uuid":
			case "ipv4":
			case "ipv6":
			case "jwt":
			case "cuid":
			case "cuid2":
			case "nanoid":
			case "ulid": {
				const input = createPlainTextInput(key, property, isRequired);
				if (input.element.type === "plain_text_input") {
					input.element.placeholder = {
						type: "plain_text",
						text: property.description || getFormatPlaceholder(property.format),
					};
				}
				return input;
			}

			default: {
				// Unknown format - use custom handler or fallback
				if (options.unknownFormatHandler) {
					return options.unknownFormatHandler(
						property.format,
						property,
						key,
						isRequired,
					);
				}
				// Fallback to plain text input
				return createPlainTextInput(key, property, isRequired);
			}
		}
	}

	// Handle by type
	const type = Array.isArray(property.type) ? property.type[0] : property.type;

	switch (type) {
		case "string": {
			return createPlainTextInput(key, property, isRequired);
		}

		case "number":
		case "integer": {
			const element: InputBlock["element"] = {
				type: "number_input",
				action_id: key,
				is_decimal_allowed: type === "number",
			};

			if (property.minimum !== undefined) {
				element.min_value = String(property.minimum);
			}
			if (property.maximum !== undefined) {
				element.max_value = String(property.maximum);
			}
			if (property.default !== undefined) {
				element.initial_value = String(property.default);
			}

			return {
				type: "input",
				block_id: key,
				element,
				label: {
					type: "plain_text",
					text: property.title || toTitleCase(key),
				},
				optional: !isRequired,
			};
		}

		case "boolean": {
			return {
				type: "input",
				block_id: key,
				element: {
					type: "checkboxes",
					action_id: key,
					options: [
						{
							text: {
								type: "plain_text",
								text: property.title || toTitleCase(key),
							},
							value: key,
						},
					],
					...(property.default === true && {
						initial_options: [
							{
								text: {
									type: "plain_text",
									text: property.title || toTitleCase(key),
								},
								value: key,
							},
						],
					}),
				},
				label: {
					type: "plain_text",
					text: property.title || toTitleCase(key),
				},
				optional: !isRequired,
			};
		}

		case "array": {
			// Arrays without enum items fall back to JSON input
			return createPlainTextInput(key, property, isRequired, true);
		}

		default: {
			// Unknown type - fallback to plain text input
			return createPlainTextInput(key, property, isRequired);
		}
	}
}

/**
 * Convert a JSON Schema (from z.toJSONSchema()) to an array of Slack InputBlocks.
 *
 * @param schema - JSON Schema object from z.toJSONSchema()
 * @param options - Optional configuration for custom format handlers
 * @returns Array of Slack InputBlocks suitable for use in a modal view
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { jsonSchemaToInputBlocks } from "@barbell/sdk";
 *
 * const toolSchema = z.object({
 *   name: z.string(),
 *   email: z.email(),
 *   price: z.number().min(0).max(1000),
 * });
 *
 * const jsonSchema = z.toJSONSchema(toolSchema);
 * const blocks = jsonSchemaToInputBlocks(jsonSchema);
 * ```
 */
export function jsonSchemaToInputBlocks(
	schema: unknown,
	options: JsonSchemaToInputBlocksOptions = {},
): InputBlock[] {
	// Type guard and validate that this is an object schema with properties
	if (
		typeof schema !== "object" ||
		schema === null ||
		!("properties" in schema) ||
		typeof schema.properties !== "object" ||
		schema.properties === null
	) {
		return [];
	}

	const typedSchema = schema as JSONSchema;
	const schemaType = Array.isArray(typedSchema.type)
		? typedSchema.type[0]
		: typedSchema.type;
	if (schemaType !== "object" || !typedSchema.properties) {
		return [];
	}

	const required = new Set(typedSchema.required || []);
	const blocks: InputBlock[] = [];

	for (const [key, property] of Object.entries(typedSchema.properties)) {
		const isRequired = required.has(key);
		blocks.push(propertyToInputBlock(key, property, isRequired, options));
	}

	return blocks;
}
