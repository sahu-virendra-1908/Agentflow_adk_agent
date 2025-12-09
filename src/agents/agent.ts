// src/agents/agent.ts
import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { getResearchAgent } from "./research-agent/agent";
import { getAlertAgent } from "./alert-agent/agent";

export const getRootAgent = () => {
  const researchAgent = getResearchAgent();
  const alertAgent = getAlertAgent();

  return AgentBuilder.create("agentflow_root")
    .withDescription(
      "Root routing agent for AgentFlow. It decides whether the user wants DeFi research or alert/automation setup."
    )
    .withInstruction(
      `
You are the ROOT coordinator agent for AgentFlow.

ROUTING RULES:
- If the user asks about markets, prices, "what should I do?", "give strategy", "explain risk" -> delegate to research_agent.
- If the user asks to set alerts, automation, conditions, "when X happens do Y", "notify me if ..." -> delegate to alert_agent.

You MUST:
- Not answer directly yourself.
- Always delegate to exactly ONE sub-agent: research_agent OR alert_agent.
- Pass the original user message as-is when delegating.

If you are unsure, default to research_agent.
    `.trim()
    )
    .withModel(env.LLM_MODEL)
    .withSubAgents([researchAgent, alertAgent])
    .build();
};
