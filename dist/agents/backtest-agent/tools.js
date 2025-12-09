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
exports.backtestStrategyTool = void 0;
// src/agents/backtest-agent/tools.ts
const adk_1 = require("@iqai/adk");
const z = __importStar(require("zod"));
const COINGECKO_IDS = {
    btc: "bitcoin",
    eth: "ethereum",
    bitcoin: "bitcoin",
    ethereum: "ethereum"
};
exports.backtestStrategyTool = (0, adk_1.createTool)({
    name: "backtest_strategy",
    description: "Backtest a simple spot strategy on historical daily prices. Use when the user asks to backtest or simulate a rule like 'buy ETH when it drops 5%.",
    schema: z.object({
        asset: z
            .string()
            .describe("Asset symbol, e.g. 'ETH' or 'BTC'. Default ETH.")
            .default("ETH"),
        lookbackDays: z
            .number()
            .min(10)
            .max(365)
            .default(90)
            .describe("How many days of history to backtest over."),
        dropPercent: z
            .number()
            .min(1)
            .max(50)
            .default(5)
            .describe("Percent drop from previous close that triggers a buy. E.g. 5 = buy if today's close is 5% below yesterday."),
        initialCapital: z
            .number()
            .min(100)
            .default(1000)
            .describe("Starting capital in USD for the simulation.")
    }),
    // 👇 yahan args ko plain object ki tarah le rahe hain (no destructuring in signature)
    // taaki TS ko type infer karne me problem na ho.
    // ADK runtime schema ke basis pe validate karega.
    fn: async (args) => {
        const asset = (args.asset ?? "ETH").toString();
        const lookbackDays = args.lookbackDays ?? 90;
        const dropPercent = args.dropPercent ?? 5;
        const initialCapital = args.initialCapital ?? 1000;
        const symbol = asset.toLowerCase();
        const id = COINGECKO_IDS[symbol] ?? "ethereum";
        const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${lookbackDays}&interval=daily`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch price history for ${asset} from CoinGecko: ${res.status}`);
        }
        const json = await res.json();
        const prices = json.prices
            .map(([ts, price]) => ({
            timestamp: ts,
            date: new Date(ts).toISOString().slice(0, 10),
            price
        }))
            .filter((p) => typeof p.price === "number");
        if (prices.length < 3) {
            throw new Error("Not enough price data for backtest.");
        }
        // Simple strategy:
        // - If today's close is <= (1 - dropPercent%) * yesterday close, BUY with all cash at today's close.
        // - SELL next day's close.
        let cash = initialCapital;
        let position = 0;
        let equity = initialCapital;
        const trades = [];
        const equityCurve = [];
        for (let i = 1; i < prices.length - 1; i++) {
            const prev = prices[i - 1];
            const today = prices[i];
            const tomorrow = prices[i + 1];
            // Track equity if flat
            if (position === 0) {
                equity = cash;
            }
            else {
                equity = position * today.price;
            }
            equityCurve.push({ date: today.date, equity });
            const drop = ((prev.price - today.price) / prev.price) * 100; // % drop from prev
            // If drop >= trigger and we are in cash, buy
            if (position === 0 && drop >= dropPercent) {
                position = cash / today.price;
                cash = 0;
                // Sell next day at close
                const sellValue = position * tomorrow.price;
                const pnlPercent = ((sellValue - initialCapital) / initialCapital) * 100;
                trades.push({
                    entryDate: today.date,
                    exitDate: tomorrow.date,
                    entryPrice: Number(today.price.toFixed(2)),
                    exitPrice: Number(tomorrow.price.toFixed(2)),
                    pnlPercent: Number(pnlPercent.toFixed(2))
                });
                cash = sellValue;
                position = 0;
            }
        }
        // Final equity
        const lastPrice = prices[prices.length - 1];
        if (position > 0) {
            equity = position * lastPrice.price;
        }
        else {
            equity = cash;
        }
        equityCurve.push({
            date: lastPrice.date,
            equity
        });
        const totalReturnPct = ((equity - initialCapital) / initialCapital) * 100;
        const summary = `In the last ${lookbackDays} days, starting with $${initialCapital.toFixed(2)}, this simple "${dropPercent}% drop then buy, sell next day" strategy on ${asset.toUpperCase()} would result in approximately ${totalReturnPct.toFixed(2)}% total return across ${trades.length} trades.`;
        const priceSeries = prices.map((p) => ({
            date: p.date,
            price: Number(p.price.toFixed(2))
        }));
        return {
            asset: asset.toUpperCase(),
            lookbackDays,
            dropPercent,
            initialCapital,
            finalEquity: Number(equity.toFixed(2)),
            totalReturnPct: Number(totalReturnPct.toFixed(2)),
            trades,
            equityCurve,
            priceSeries,
            summary
        };
    }
});
