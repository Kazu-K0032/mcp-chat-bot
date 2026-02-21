import { Mastra } from "@mastra/core";
import { lunaAgent } from "./agents/luna";

export const mastra = new Mastra({
  agents: { lunaAgent },
});

export { lunaAgent };
