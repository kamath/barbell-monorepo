import type { BarbellContext, Block, MainFunction } from "@barbell/sdk";

/**
 * Response format returned by the worker.
 */
export interface WorkerResponse {
	blocks?: Block[];
	error?: boolean;
	message?: string;
}

/**
 * Creates a Cloudflare Worker handler from a customer's main function.
 * This wraps the simple async function in the CF Worker fetch interface.
 *
 * @param main - The customer's main function
 * @returns A CF Worker-compatible default export
 */
export function createWorker(main: MainFunction) {
	return {
		async fetch(request: Request): Promise<Response> {
			try {
				// Parse the structured context from barbell server
				const context: BarbellContext = await request.json();

				// Call customer's main function
				const blocks: Block[] = await main(context);

				// Return blocks as JSON
				const response: WorkerResponse = { blocks };
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
