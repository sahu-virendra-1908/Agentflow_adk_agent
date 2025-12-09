// src/agents/research-agent/agent.ts
import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";
import { tokenPriceTool, marketSummaryTool } from "./tools";

export const getResearchAgent = () => {
  const researchAgent = new LlmAgent({
    name: "research_agent",
    description:
      "A DeFi research agent that fetches token prices, analyzes markets, and gives user-friendly summaries.",
    model: env.LLM_MODEL,
    tools: [tokenPriceTool, marketSummaryTool],
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
