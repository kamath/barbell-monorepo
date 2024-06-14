import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { getActionValue, openModal, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";
import bot from "./actions";
import { INIT_ACTION_ID, INIT_MODAL_NAME } from "./consts";
import { BlockPromptSkeleton, BlockPromptConstructor, BlockModalConstructor } from "./payloads/prompt";
import { ModalView } from "@slack/web-api";

type SlackPayload = ShortcutPayload | BlockActionsPayload;

const blockPromptSkeleton: BlockPromptSkeleton = {
  type: "modal",
  title: INIT_MODAL_NAME,
  action_id: INIT_ACTION_ID,
  submit: "Submit",
  blocks: [],
};

const app = new Elysia();
app.get("/", () => "Hello Elysia");
app.post("/slack/events", async ({ body }: { body: any }) => {
  if (body.challenge) {
    return body.challenge;
  } else if (body.payload) {
    const payload: SlackPayload = JSON.parse(body.payload);
    switch (payload.type) {

      case "shortcut":
        const blockPromptConstructor = new BlockPromptConstructor(blockPromptSkeleton, Object.values(bot.getActions()));
        const modal = blockPromptConstructor.getPromptModal(payload.trigger_id);
        await openModal(payload.trigger_id, modal as ModalView);
        break;
		
      case "block_actions":
        console.log("Block Actions Payload", payload);
        const blockActionsPayload = payload as BlockActionsPayload;
        const actionInput = blockActionsPayload.actions[0];
		
        if (actionInput.action_id !== INIT_ACTION_ID) {
          if (blockActionsPayload.view.state) {
            const promptConstructor = new BlockModalConstructor(blockActionsPayload, blockActionsPayload.view.title.text);
            const promptFolowup = await promptConstructor.getExistingModal();
            await updateModal(blockActionsPayload.view.id, promptFolowup as ModalView);
          }
          return;
        } else {
          const promptConstructor = new BlockModalConstructor(blockActionsPayload, getActionValue(actionInput));
          const initalAction = await promptConstructor.getNewModal();
          await updateModal(blockActionsPayload.view.id, initalAction as ModalView);
          return;
        }
        break;
      default:
        console.log("Unknown payload type", body.payload);
    }
  }
});
app.listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
