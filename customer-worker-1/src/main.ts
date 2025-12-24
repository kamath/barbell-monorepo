import type { BarbellConfig, MessageContext } from "@barbell/sdk";
import type { Tool } from "ai";
import { z } from "zod";

const tools = {
	project_details: {
		description: "Enter project details",
		inputSchema: z.object({
			project_name: z.string().describe("Enter project name"),
			email: z.email().describe("Enter email").default("test@test.com"),
			priority_select: z
				.enum(["High", "Medium", "Low"])
				.describe("Select priority"),
			due_date: z.iso.date().describe("Due Date"),
			due_time: z.iso.time().describe("Submission Time"),
			team_members: z
				.array(z.enum(["Design", "Engineering", "Marketing"]))
				.describe("Select teammates"),
		}),
		execute: async ({
			project_name,
			priority_select,
			due_date,
			due_time,
			team_members,
		}): Promise<string> => {
			const teamMembersText =
				Array.isArray(team_members) && team_members.length > 0
					? `\n*Involved Departments:* ${team_members.join(", ")}`
					: "";

			return `:white_check_mark: Project details submitted successfully!

*Project Name:* ${project_name || "N/A"}
*Priority:* ${priority_select || "N/A"}
*Due Date:* ${due_date || "N/A"}
*Due Time:* ${due_time || "N/A"}${teamMembersText}`;
		},
	},
} satisfies Record<string, Tool>;

const chooseTool = async (
	context: MessageContext,
): Promise<keyof typeof tools> => {
	const { threadMessages } = context;
	const lastMessage = threadMessages[threadMessages.length - 1];
	const lastMessageText = lastMessage.text;
	if (lastMessageText?.includes("project details")) {
		return "project_details";
	}
	throw new Error("No tool chosen");
};

export default {
	tools,
	chooseTool,
} satisfies BarbellConfig<typeof tools>;
