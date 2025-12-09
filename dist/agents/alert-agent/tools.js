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
exports.registerAlertTool = void 0;
// src/agents/alert-agent/tools.ts
const adk_1 = require("@iqai/adk");
const z = __importStar(require("zod"));
/**
 * Tool: register_alert
 * The agent uses this to "register" an automation rule for the user.
 * In this demo, it just logs to console and returns a structured confirmation.
 */
exports.registerAlertTool = (0, adk_1.createTool)({
    name: "register_alert",
    description: "Register an alert or automation rule, like 'alert when BTC > 80000' or 'notify when APT drops 10%'.",
    schema: z.object({
        asset: z.string().describe("Asset symbol or name, e.g. BTC, ETH, APT."),
        condition: z
            .string()
            .describe("Natural language condition, e.g. 'above 80000', 'drops 10%'."),
        category: z
            .enum(["price", "yield", "volatility"])
            .describe("What type of trigger this is."),
        userNote: z
            .string()
            .optional()
            .describe("Optional human note about why the user wants this.")
    }),
    fn: async ({ asset, condition, category, userNote }) => {
        const alert = {
            asset,
            condition,
            category,
            userNote: userNote ?? "",
            createdAt: new Date().toISOString()
        };
        // For demo purposes, just log. In a real app, persist to DB or on-chain.
        console.log("🔔 Registered new alert:", alert);
        return {
            message: "Alert registered successfully (demo).",
            alert
        };
    }
});
