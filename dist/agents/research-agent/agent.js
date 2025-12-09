"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResearchAgent = void 0;
// src/agents/research-agent/agent.ts
const adk_1 = require("@iqai/adk");
const env_1 = require("../../env");
const tools_1 = require("./tools");
const getResearchAgent = () => {
    const researchAgent = new adk_1.LlmAgent({
        name: "research_agent",
        description: "A DeFi research agent that fetches token prices, analyzes markets, and gives user-friendly summaries.",
        model: env_1.env.LLM_MODEL,
        tools: [tools_1.tokenPriceTool, tools_1.marketSummaryTool],
        instruction: `
You are a DeFi research analyst.

- Use get_token_prices to fetch numeric data whenever user asks about markets, prices, or DeFi conditions.
- You may optionally call summarize_market when the user wants an overall view or recommendations.
- Always clearly explain risk (volatility, drawdown risk), and never promise returns.
- Prefer short, structured answers with bullet points when recommending strategies.
    `.trim()
    });
    return researchAgent;
};
exports.getResearchAgent = getResearchAgent;
