import type {
	BarbellContext,
	BarbellConfig,
	KnownBlock,
	MessageContext,
	View,
	ViewSubmissionContext,
} from "@barbell/sdk";
import { jsonSchemaToInputBlocks } from "@barbell/sdk";
import type { Tool } from "ai";
import { z } from "zod";

/**
 * Response format returned by the worker.
 */
export interface WorkerResponse {
	blocks?: KnownBlock[];
	view?: View;
	error?: boolean;
	message?: string;
}

/**
 * Parses view submission values into a flat object keyed by action_id.
 * Handles the nested structure: block_id -> action_id -> value
 */
function parseViewSubmissionValues(
	values: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
	const parsed: Record<string, unknown> = {};

	for (const blockId in values) {
		const blockValues = values[blockId];
		for (const actionId in blockValues) {
			const valueObj = blockValues[actionId] as {
				type?: string;
				value?: string;
				selected_date?: string;
				selected_time?: string;
				selected_option?: { value: string };
				selected_options?: Array<{ value: string }>;
			};

			if (valueObj.type === "plain_text_input") {
				parsed[actionId] = valueObj.value || "";
			} else if (valueObj.type === "static_select") {
				parsed[actionId] = valueObj.selected_option?.value || "";
			} else if (valueObj.type === "multi_static_select") {
				parsed[actionId] =
					valueObj.selected_options?.map((opt) => opt.value) || [];
			} else if (valueObj.type === "datepicker") {
				parsed[actionId] = valueObj.selected_date || "";
			} else if (valueObj.type === "timepicker") {
				parsed[actionId] = valueObj.selected_time || "";
			} else {
				// Fallback: try to extract value or selected_option
				parsed[actionId] =
					valueObj.value ||
					valueObj.selected_option?.value ||
					valueObj.selected_date ||
					valueObj.selected_time ||
					null;
			}
		}
	}

	return parsed;
}

/**
 * Renders a modal view for a given tool.
 */
function renderModal(
	context: BarbellContext,
	toolName: string,
	tool: Tool,
): View {
	// Convert Zod schema to JSON Schema, then to Slack input blocks
	const zodSchema = tool.inputSchema as unknown as z.ZodTypeAny;
	const jsonSchema = z.toJSONSchema(zodSchema);
	const blocks = jsonSchemaToInputBlocks(jsonSchema);

	// Store channel and thread context in private_metadata so we can respond in the same thread
	const privateMetadata = JSON.stringify({
		channel: context.event.channel,
		thread_ts: context.event.thread_ts,
		ts: context.event.ts,
	});

	// Use tool description or tool name as modal title
	const modalTitle = tool.description || toolName;

	return {
		type: "modal",
		callback_id: toolName,
		title: {
			type: "plain_text",
			text: modalTitle,
		},
		submit: {
			type: "plain_text",
			text: "Submit",
		},
		close: {
			type: "plain_text",
			text: "Cancel",
		},
		blocks,
		private_metadata: privateMetadata,
	};
}

/**
 * Renders the initial message with a button to open the modal.
 */
function renderInitialMessage(
	context: BarbellContext,
	_toolName: string,
	_tool: Tool,
): KnownBlock[] {
	const { event } = context;

	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `Hello <@${event.user}>! Click the button below to open the form.`,
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Open Modal",
						emoji: true,
					},
					action_id: "open_modal",
					style: "primary",
				},
			],
		},
	];
}

/**
 * Creates a Cloudflare Worker handler from a customer's config object.
 * This handles all orchestration logic including modal rendering, message handling,
 * and view submission processing.
 *
 * @param config - The customer's config object with tools and optional chooseTool function
 * @returns A CF Worker-compatible default export
 */
export function createWorker<T extends Record<string, Tool>>(
	config: BarbellConfig<T>,
) {
	return {
		async fetch(request: Request): Promise<Response> {
			try {
				// Parse the structured context from barbell server
				const context: BarbellContext = await request.json();

				// Get tool names
				const toolNames = Object.keys(config.tools) as Array<keyof T>;
				if (toolNames.length === 0) {
					throw new Error("No tools defined in config");
				}

				// Handle view submission (modal form submission)
				if ("viewSubmission" in context) {
					const viewSubmissionContext = context as ViewSubmissionContext;
					const { callback_id, values } = viewSubmissionContext.viewSubmission;

					// Find the tool by callback_id
					const toolName = callback_id as keyof T;
					const tool = config.tools[toolName];

					if (!tool || !tool.execute) {
						console.error(`Tool not found or invalid: ${String(toolName)}`);
						return new Response(
							JSON.stringify({ blocks: [] } satisfies WorkerResponse),
							{
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Parse the nested view values into a flat object
					const parsedValues = parseViewSubmissionValues(values);

					// Execute the tool with parsed values
					try {
						const message = await (
							tool.execute as (
								params: Record<string, unknown>,
							) => Promise<string>
						)(parsedValues);

						// Convert the string to a single mrkdwn block
						const response: WorkerResponse = {
							blocks: [
								{
									type: "section",
									text: {
										type: "mrkdwn",
										text: message,
									},
								},
							],
						};

						return new Response(JSON.stringify(response), {
							headers: { "Content-Type": "application/json" },
						});
					} catch (error) {
						console.error("Tool execution error:", error);
						// Return error block to show in thread
						const response: WorkerResponse = {
							blocks: [
								{
									type: "section",
									text: {
										type: "mrkdwn",
										text: `:warning: Error processing form: ${error instanceof Error ? error.message : "Unknown error"}`,
									},
								},
							],
						};

						return new Response(JSON.stringify(response), {
							headers: { "Content-Type": "application/json" },
						});
					}
				}

				// Determine which tool to use
				let selectedToolName: keyof T;
				if ("threadMessages" in context && config.chooseTool) {
					// Use chooseTool if provided and we have a MessageContext
					selectedToolName = await config.chooseTool(context);
				} else {
					// Default to first tool
					selectedToolName = toolNames[0];
				}

				const selectedTool = config.tools[selectedToolName];
				if (!selectedTool) {
					throw new Error(`Tool not found: ${String(selectedToolName)}`);
				}

				// Handle block actions (button clicks, etc.)
				if ("blockAction" in context) {
					const actions = context.blockAction || [];
					const isOpeningModal = actions.some(
						(a) => a.action_id === "open_modal",
					);

					if (isOpeningModal) {
						const view = renderModal(
							context,
							String(selectedToolName),
							selectedTool,
						);
						const response: WorkerResponse = { view };
						return new Response(JSON.stringify(response), {
							headers: { "Content-Type": "application/json" },
						});
					}
				}

				// Handle message context (initial mention)
				if ("threadMessages" in context) {
					const blocks = renderInitialMessage(
						context,
						String(selectedToolName),
						selectedTool,
					);
					const response: WorkerResponse = { blocks };
					return new Response(JSON.stringify(response), {
						headers: { "Content-Type": "application/json" },
					});
				}

				// Fallback: return empty blocks
				const response: WorkerResponse = { blocks: [] };
				return new Response(JSON.stringify(response), {
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				const response: WorkerResponse = {
					error: true,
					message: errorMessage,
				};
				return new Response(JSON.stringify(response), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				});
			}
		},
	};
}
