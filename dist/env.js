"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// src/env.ts
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// ✅ Explicit path to .env in project root
const envPath = path_1.default.resolve(__dirname, "..", ".env");
(0, dotenv_1.config)({ path: envPath });
console.log("Loaded GOOGLE_API_KEY =", process.env.GOOGLE_API_KEY);
console.log("Loaded LLM_MODEL =", process.env.LLM_MODEL);
exports.env = {
    GOOGLE_API_KEY: "AIzaSyBonvQo49yKSHmqbjkfHCLmkH0lEAYpTAE",
    LLM_MODEL: process.env.LLM_MODEL ?? "gemini-2.5-flash"
};
if (!exports.env.GOOGLE_API_KEY) {
    console.warn("⚠ WARNING: GOOGLE_API_KEY is missing in .env — LLM will fail.");
}
