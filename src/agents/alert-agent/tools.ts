// src/agents/alert-agent/tools.ts
import { createTool } from "@iqai/adk";
import * as z from "zod";

/**
 * Tool: register_alert
 * The agent uses this to "register" an automation rule for the user.
 * In this demo, it just logs to console and returns a structured confirmation.
 */
export const registerAlertTool = createTool({
  name: "register_alert",
  description:
    "Register an alert or automation rule, like 'alert when BTC > 80000' or 'notify when APT drops 10%'.",
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
