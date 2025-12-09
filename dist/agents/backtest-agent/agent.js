"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBacktestAgent = void 0;
// src/agents/backtest-agent/agent.ts
const adk_1 = require("@iqai/adk");
const env_1 = require("../../env");
const tools_1 = require("./tools");
const getBacktestAgent = () => {
    const backtestAgent = new adk_1.LlmAgent({
        name: "backtest_agent",
        description: "A DeFi quant agent that backtests simple spot strategies like 'buy ETH when it drops 5%' on recent historical prices.",
        model: env_1.env.LLM_MODEL,
        tools: [tools_1.backtestStrategyTool],
        instruction: `
You are a DeFi quant / backtesting assistant.

WHEN TO USE:
- User asks: "backtest", "simulate", "how would this strategy perform", "if I bought ETH on 5% dips" etc.
- You MUST call the "backtest_strategy" tool to get real numbers.

HOW TO MAP USER REQUEST TO TOOL:
- Infer asset from the message: e.g. "ETH", "BTC". Default to ETH if unclear.
- Infer dropPercent from phrases like "drops 5%", "5% dip", etc. Default 5 if unclear.
- Use lookbackDays ~ 90 by default unless user specifies "last year", "last month" etc.
- Use initialCapital = 1000 if user does not specify capital.

HOW TO RESPOND:
1) Clearly describe:
   - The strategy in plain English (what we tested).
   - Time period (lookbackDays).
   - Total return %, starting and ending capital.
   - Number of trades.
   - A short interpretation: is this strategy attractive? risky? very noisy?

2) VERY IMPORTANT FOR FRONTEND CHART:
   - At the END of your answer, output a block EXACTLY in this format:

   BACKTEST_DATA:
   \`\`\`json
   { ...full JSON tool result exactly as you received it... }
   \`\`\`

   - Do NOT modify keys or field names.
   - Do NOT add extra text inside the JSON.
   - The normal explanation should come BEFORE this block.

3) Keep tone helpful and concise for non-quants.
`.trim()
    });
    return backtestAgent;
};
exports.getBacktestAgent = getBacktestAgent;
