import { ViewsPublishArguments } from "@slack/web-api";
import { intentBlocks } from "./slack";
import { open_garage_and_gate_blocks } from "./openGarage";

export async function publishTestHomeTab(user_id: string) {
	console.log("publishTestHomeTab", user_id);
	return {
		"user_id": user_id,
		"view": {
			"type": "home",
			"blocks": [
				...open_garage_and_gate_blocks(),
				...intentBlocks
			]
		}
	} as ViewsPublishArguments
}