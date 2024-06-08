// Action.ts
import { Logger } from './Logger';

export interface ActionDefinition {
  name: string;
  handler: () => Promise<void>;
}

export default class Action {
  name: string;
  handler: () => Promise<void>;

  constructor({ name, handler }: ActionDefinition) {
    this.name = name;
    this.handler = handler;
  }

  async execute() {
    try {
      Logger.info(`Executing action: ${this.name}`);
      await this.handler();
    } catch (error) {
      Logger.error(`Error executing action ${this.name}: ${error}`);
    }
  }
}