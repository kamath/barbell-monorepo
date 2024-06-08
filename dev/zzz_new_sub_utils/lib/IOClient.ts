// IOClient.ts
import { v4 as uuidv4 } from 'uuid';
import { mapIOInputToSlackBlock } from './slackMapper';
import { sendSlackMessage } from './slackApi';
import { Logger } from './Logger';

type IOInputType = 'date' | 'email'; // Add other valid types as needed

interface IOInputDefinition {
  type: IOInputType;
  label: string;
  id: string;
}

class IOClient {
  private channel: string;
  private responseHandlers: { [id: string]: (value: any) => void } = {};

  handleResponse(response: { id: string; value: any }) {
    const handler = this.responseHandlers[response.id];
    if (handler) {
      handler(response.value);
      delete this.responseHandlers[response.id]; // Clean up after handling
    } else {
      Logger.warn(`No handler registered for response ID: ${response.id}`);
    }
  }

  constructor(channel: string) {
    this.channel = channel;
  }

  async input(type: IOInputType, label: string): Promise<any> {
    const id = `${type}-${uuidv4()}`;
    const ioInput: IOInputDefinition = { type, label, id };
    const slackBlock = mapIOInputToSlackBlock(ioInput);

    await sendSlackMessage(this.channel, [slackBlock]);

    // Simulate user response for demo purposes
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        if (type === 'date') {
          resolve(new Date().toISOString());
        } else {
          resolve('user@example.com');
        }
      }, 2000);
    });
  }
}

export default IOClient;
