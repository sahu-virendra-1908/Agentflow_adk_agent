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
exports.portfolioAnalyzerTool = void 0;
// src/agents/portfolio-agent/tools.ts
const adk_1 = require("@iqai/adk");
const z = __importStar(require("zod"));
/**
 * Tool: analyze_portfolio
 *
 * LLM is expected to convert natural language like:
 * "60% BTC, 30% ETH, 10% USDC, I am low risk"
 * into a structured call:
 *
 * {
 *   holdings: [
 *     { symbol: "BTC", allocationPercent: 60, assetType: "bluechip" },
 *     { symbol: "ETH", allocationPercent: 30, assetType: "bluechip" },
 *     { symbol: "USDC", allocationPercent: 10, assetType: "stablecoin" }
 *   ],
 *   riskPreference: "low"
 * }
 */
exports.portfolioAnalyzerTool = (0, adk_1.createTool)({
    name: "analyze_portfolio",
    description: "Analyze portfolio risk given asset allocations. Use when the user asks about portfolio risk, diversification, or if their holdings are too risky.",
    schema: z.object({
        holdings: z
            .array(z.object({
            symbol: z.string().describe("Token symbol, e.g. BTC, ETH, USDC"),
            allocationPercent: z
                .number()
                .min(0)
                .max(100)
                .describe("Percentage of total portfolio in this asset."),
            assetType: z
                .enum(["stablecoin", "bluechip", "altcoin"])
                .describe("Approximate category. Stablecoins like USDC/USDT, bluechips like BTC/ETH, altcoins for the rest.")
        }))
            .min(1)
            .describe("Array of assets in the portfolio with their allocation and type."),
        riskPreference: z
            .enum(["low", "medium", "high"])
            .default("medium")
            .describe("User's stated risk preference.")
    }),
    fn: async ({ holdings, riskPreference }) => {
        const total = holdings.reduce((sum, h) => sum + (h.allocationPercent || 0), 0);
        // Normalize if not exactly 100
        const normalizedHoldings = total > 0
            ? holdings.map((h) => ({
                ...h,
                allocationPercent: (h.allocationPercent / total) * 100
            }))
            : holdings;
        const assetCount = normalizedHoldings.length;
        const largestAllocation = Math.max(...normalizedHoldings.map((h) => h.allocationPercent));
        const stablePercent = normalizedHoldings
            .filter((h) => h.assetType === "stablecoin")
            .reduce((sum, h) => sum + h.allocationPercent, 0);
        const bluechipPercent = normalizedHoldings
            .filter((h) => h.assetType === "bluechip")
            .reduce((sum, h) => sum + h.allocationPercent, 0);
        const altcoinPercent = normalizedHoldings
            .filter((h) => h.assetType === "altcoin")
            .reduce((sum, h) => sum + h.allocationPercent, 0);
        // Very simple diversification score
        let diversificationScore = 0;
        if (assetCount >= 6)
            diversificationScore += 2;
        else if (assetCount >= 3)
            diversificationScore += 1;
        if (largestAllocation <= 50)
            diversificationScore += 2;
        else if (largestAllocation <= 70)
            diversificationScore += 1;
        if (stablePercent >= 40)
            diversificationScore += 2;
        else if (stablePercent >= 20)
            diversificationScore += 1;
        // Base rating from allocation mix
        let baseRisk = "medium";
        if (stablePercent >= 50 && altcoinPercent <= 20 && largestAllocation <= 50) {
            baseRisk = "low";
        }
        else if (altcoinPercent >= 50 ||
            largestAllocation >= 75 ||
            (stablePercent < 10 && altcoinPercent > 40)) {
            baseRisk = "high";
        }
        else {
            baseRisk = "medium";
        }
        // Adjust based on user preference (if user wants low risk but portfolio is aggressive, flag)
        let alignment = "good";
        if (riskPreference === "low" && baseRisk === "high") {
            alignment = "mismatch";
        }
        else if (riskPreference === "high" && baseRisk === "low") {
            alignment = "too_conservative";
        }
        const riskEmoji = baseRisk === "low" ? "🟢" : baseRisk === "medium" ? "🟡" : "🔴";
        return {
            summary: {
                baseRisk,
                riskEmoji,
                riskPreference,
                alignment
            },
            metrics: {
                assetCount,
                largestAllocation: Number(largestAllocation.toFixed(2)),
                stablePercent: Number(stablePercent.toFixed(2)),
                bluechipPercent: Number(bluechipPercent.toFixed(2)),
                altcoinPercent: Number(altcoinPercent.toFixed(2)),
                diversificationScore
            },
            normalizedHoldings
        };
    }
});
