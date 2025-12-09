// src/env.ts
import { config } from "dotenv";
import path from "path";

// ✅ Explicit path to .env in project root
const envPath = path.resolve(__dirname, "..", ".env");
config({ path: envPath });

console.log("Loaded GOOGLE_API_KEY =", process.env.GOOGLE_API_KEY);
console.log("Loaded LLM_MODEL =", process.env.LLM_MODEL);

export const env = {
  GOOGLE_API_KEY: "AIzaSyBonvQo49yKSHmqbjkfHCLmkH0lEAYpTAE",
  LLM_MODEL: process.env.LLM_MODEL ?? "gemini-2.5-flash"
};

if (!env.GOOGLE_API_KEY) {
  console.warn(
    "⚠ WARNING: GOOGLE_API_KEY is missing in .env — LLM will fail."
  );
}
