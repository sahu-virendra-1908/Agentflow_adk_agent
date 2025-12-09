// src/agents/research-agent/tools.ts
import { createTool } from "@iqai/adk";
import * as z from "zod";

/**
 * Tool: get_token_prices
 * Given a list of token ids (coingecko-style), returns current USD prices.
 * Example ids: "bitcoin", "ethereum", "frax", "tether"
 */
export const tokenPriceTool = createTool({
  name: "get_token_prices",
  description:
    "Fetch current USD prices for a list of tokens using a public market API. Use this whenever you need hard numbers for DeFi or market analysis.",
  schema: z.object({
    tokens: z
      .array(z.string())
      .min(1)
      .describe(
        "An array of token ids (e.g. 'bitcoin', 'ethereum', 'frax', 'tether')"
      )
  }),
  fn: async ({ tokens }) => {
    const ids = tokens.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids
    )}&vs_currencies=usd`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      return {
        source: "coingecko-simple-price",
        tokens: data
      };
    } catch (err) {
      console.error("Error fetching token prices:", err);
      return {
        error: "Failed to fetch token prices. Try again later.",
        tokens
      };
    }
  }
});

/**
 * Tool: summarize_market
 * The agent can call this tool after fetching data to produce a structured
 * summary string. This is mostly to show multi-step tool usage.
 */
export const marketSummaryTool = createTool({
  name: "summarize_market",
  description:
    "Given raw token price data and a user goal, produce a short, structured DeFi summary.",
  schema: z.object({
    rawData: z.any().describe("The raw JSON token data previously fetched."),
    userGoal: z
      .string()
      .describe("What the user cares about, e.g. 'low risk', 'max yield'.")
  }),
  fn: async ({ rawData, userGoal }) => {
    // In a real system you might do numeric calculations here.
    // For the hackathon, we just echo and let the LLM reason on top.
    return {
      note:
        "Here is raw token data and the user goal. Use this context to explain market view in natural language.",
      userGoal,
      rawData
    };
  }
});
