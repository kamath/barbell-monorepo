import { WebClient, LogLevel, Block, KnownBlock, ChatPostMessageArguments, ViewsPublishArguments, ModalView } from "@slack/web-api";
import { SLACK_SECRETS } from "../consts";

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
export const client = new WebClient(SLACK_SECRETS.SLACK_OAUTH_TOKEN, {
	// LogLevel can be imported and used to make debugging simpler
	logLevel: LogLevel.DEBUG
});

export const openModal = async (trigger_id: string, modalBlocks: ModalView) => {
	await client.views.open({ trigger_id, view: modalBlocks });
}

export const updateModal = async (viewId: string, modalBlocks: ModalView) => {
	await client.views.update({ view_id: viewId, view: modalBlocks });
}