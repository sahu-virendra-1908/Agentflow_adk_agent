// src/agents/agent.ts
import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { getResearchAgent } from "./research-agent/agent";
import { getAlertAgent } from "./alert-agent/agent";
import { getPortfolioAgent } from "./portfolio-agent/agent";

export const getRootAgent = () => {
  const researchAgent = getResearchAgent();
  const alertAgent = getAlertAgent();
  const portfolioAgent = getPortfolioAgent();

  return AgentBuilder.create("agentflow_root")
    .withDescription(
      "Root routing agent for AgentFlow. It decides whether the user wants DeFi research, alert/automation setup, or portfolio risk analysis."
    )
    .withInstruction(
      `
You are the ROOT coordinator agent for AgentFlow.

You DO NOT answer directly. You ONLY route the user's message to exactly ONE sub-agent:
- research_agent
- alert_agent
- portfolio_agent

ROUTING RULES (very important):

1) Route to research_agent when:
   - The user asks about markets, prices, DeFi conditions, strategies, or explanations.
   - Examples:
     - "What is the BTC/ETH market looking like today?"
     - "Explain DeFi risk for a beginner."
     - "Which is safer right now, BTC or ETH?"

2) Route to alert_agent when:
   - The user wants to set alerts, triggers, or automation rules.
   - They say things like "alert me when", "notify me if", "when X happens do Y".
   - Examples:
     - "Alert me when BTC goes above 80000 USD."
     - "Notify me if ETH APY drops below 5%."

3) Route to portfolio_agent when:
   - The user is asking about THEIR PORTFOLIO risk, diversification, or allocations.
   - They mention holdings with percentages or ask "is my portfolio risky".
   - Examples:
     - "Analyze my portfolio risk."
     - "I have 60% BTC, 30% ETH, 10% USDC, is that too risky?"
     - "I am low risk, is this allocation okay?"

If you are unsure:
- Prefer portfolio_agent if the user explicitly says "my portfolio" or "my holdings".
- Otherwise, default to research_agent.

VERY IMPORTANT:
- Do NOT answer the user yourself.
- Use exactly ONE of the sub-agents per message.
- Pass the original user message as-is when delegating.
      `.trim()
    )
    .withModel(env.LLM_MODEL)
    .withSubAgents([researchAgent, alertAgent, portfolioAgent])
    .build();
};
