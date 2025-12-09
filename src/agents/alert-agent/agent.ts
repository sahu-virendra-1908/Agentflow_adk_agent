// src/agents/alert-agent/agent.ts
import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";
import { registerAlertTool } from "./tools";

export const getAlertAgent = () => {
  const alertAgent = new LlmAgent({
    name: "alert_agent",
    description:
      "An automation agent that converts natural language conditions into structured DeFi alerts and strategies.",
    model: env.LLM_MODEL,
    tools: [registerAlertTool],
    instruction: `
You are an automation and alert configuration assistant.

Your job:
- Read the user's natural language description of a DeFi rule.
- Extract asset, condition, category and an optional note.
- Call register_alert with a clean, concise representation of the rule.
- Explain back to the user what was registered.

Examples:
- "alert me if BTC goes above 80000" -> asset: BTC, condition: "price above 80000 USD", category: price
- "notify me if ETH APY on any pool falls below 5%" -> asset: ETH, condition: "APY below 5% on any pool", category: yield
    `.trim()
  });

  return alertAgent;
};
