"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketSummaryTool = exports.tokenPriceTool = void 0;
// src/agents/research-agent/tools.ts
const adk_1 = require("@iqai/adk");
const z = __importStar(require("zod"));
/**
 * Tool: get_token_prices
 * Given a list of token ids (coingecko-style), returns current USD prices.
 * Example ids: "bitcoin", "ethereum", "frax", "tether"
 */
exports.tokenPriceTool = (0, adk_1.createTool)({
    name: "get_token_prices",
    description: "Fetch current USD prices for a list of tokens using a public market API. Use this whenever you need hard numbers for DeFi or market analysis.",
    schema: z.object({
        tokens: z
            .array(z.string())
            .min(1)
            .describe("An array of token ids (e.g. 'bitcoin', 'ethereum', 'frax', 'tether')")
    }),
    fn: async ({ tokens }) => {
        const ids = tokens.join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return {
                source: "coingecko-simple-price",
                tokens: data
            };
        }
        catch (err) {
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
exports.marketSummaryTool = (0, adk_1.createTool)({
    name: "summarize_market",
    description: "Given raw token price data and a user goal, produce a short, structured DeFi summary.",
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
            note: "Here is raw token data and the user goal. Use this context to explain market view in natural language.",
            userGoal,
            rawData
        };
    }
});
