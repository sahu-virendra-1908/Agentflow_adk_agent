// src/env.ts
import { config } from "dotenv";

config(); // Loads .env from project root

export const env = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, 
  LLM_MODEL: process.env.LLM_MODEL ?? "gemini-2.5-flash"
};

if (!env.GOOGLE_API_KEY) {
  console.warn("⚠ WARNING: GOOGLE_API_KEY is missing in .env — LLM will fail.");
}
