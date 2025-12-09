// src/index.ts
import * as dotenv from "dotenv";
import { getRootAgent } from "./agents/agent";

dotenv.config();

async function main() {
  const questions = [
    "Give me a short DeFi market overview for bitcoin and ethereum. Assume I am low risk.",
    "Set an alert for BTC when the price goes above 80000 USD.",
    "I want another alert when ETH APY on any pool falls below 5%."
  ];

  const { runner } = await getRootAgent();

  for (const q of questions) {
    console.log("\n====================================");
    console.log("🧑 User:", q);
    const response = await runner.ask(q);
    console.log("🤖 AgentFlow:", response);
  }
}

main().catch(console.error);
