"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertAgent = void 0;
// src/agents/alert-agent/agent.ts
const adk_1 = require("@iqai/adk");
const env_1 = require("../../env");
const tools_1 = require("./tools");
const getAlertAgent = () => {
    const alertAgent = new adk_1.LlmAgent({
        name: "alert_agent",
        description: "An automation agent that converts natural language conditions into structured DeFi alerts and strategies.",
        model: env_1.env.LLM_MODEL,
        tools: [tools_1.registerAlertTool],
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
exports.getAlertAgent = getAlertAgent;
