// slackMapper.ts
import { Block, KnownBlock } from '@slack/types';
import { v4 as uuidv4 } from 'uuid';

// Define IO Input Types
type IOInputType = 'text' | 'email' | 'date';

interface IOInputDefinition {
  type: IOInputType;
  label: string;
  id: string;
}

// Define a function to map IO input definitions to Slack Block Kit components
export function mapIOInputToSlackBlock(ioInput: IOInputDefinition): KnownBlock {
  const blockId = uuidv4();
  switch (ioInput.type) {
    case 'text':
      return {
        type: 'input',
        block_id: blockId,
        label: {
          type: 'plain_text',
          text: ioInput.label,
        },
        element: {
          type: 'plain_text_input',
          action_id: ioInput.id,
        },
      };
    case 'email':
      return {
        type: 'input',
        block_id: blockId,
        label: {
          type: 'plain_text',
          text: ioInput.label,
        },
        element: {
          type: 'plain_text_input',
          action_id: ioInput.id,
        },
      };
    case 'date':
      return {
        type: 'input',
        block_id: blockId,
        label: {
          type: 'plain_text',
          text: ioInput.label,
        },
        element: {
          type: 'datepicker',
          action_id: ioInput.id,
        },
      };
    default:
      throw new Error(`Unsupported IO input type: ${ioInput.type}`);
  }
}