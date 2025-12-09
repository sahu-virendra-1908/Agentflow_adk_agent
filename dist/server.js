"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const agent_1 = require("./agents/agent");
// Since we're using CommonJS (tsconfig: module=CommonJS), __dirname is available
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static frontend from /public
const publicPath = path_1.default.join(process.cwd(), "public");
app.use(express_1.default.static(publicPath));
// Initialize agent runner once
async function bootstrap() {
    console.log("🚀 Starting AgentFlow server...");
    console.log("📦 Serving static files from:", publicPath);
    console.log("🧠 Initializing root agent...");
    const { runner } = await (0, agent_1.getRootAgent)();
    // API endpoint: /api/ask
    app.post("/api/ask", async (req, res) => {
        try {
            const message = req.body?.message;
            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "message (string) is required" });
            }
            console.log("\n🧑 [API] User:", message);
            const response = await runner.ask(message);
            console.log("🤖 [API] AgentFlow:", response);
            res.json({ reply: response });
        }
        catch (err) {
            console.error("❌ Agent error:", err);
            const msg = String(err?.message ?? err);
            if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
                return res.status(429).json({
                    error: "Gemini API quota exceeded. Please wait a bit or reduce the number of requests.",
                    raw: msg
                });
            }
            res
                .status(500)
                .json({ error: "Internal agent error", details: msg ?? "unknown" });
        }
    });
    //   // Fallback: SPA support (serve index.html for any other route)
    //   app.get("*", (_, res) => {
    //     res.sendFile(path.join(publicPath, "index.html"));
    //   });
    app.use((_, res) => {
        res.sendFile(path_1.default.join(publicPath, "index.html"));
    });
    app.listen(PORT, () => {
        console.log(`🌐 AgentFlow UI: http://localhost:${PORT}`);
    });
}
bootstrap().catch((e) => {
    console.error("❌ Failed to start server:", e);
    process.exit(1);
});
