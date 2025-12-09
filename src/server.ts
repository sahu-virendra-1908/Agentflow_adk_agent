// src/server.ts
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // If using ES modules, but we're on CommonJS, so ignore
import { getRootAgent } from "./agents/agent";
import { env } from "./env";

// Since we're using CommonJS (tsconfig: module=CommonJS), __dirname is available
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend from /public
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

// Initialize agent runner once
async function bootstrap() {
  console.log("🚀 Starting AgentFlow server...");
  console.log("📦 Serving static files from:", publicPath);
  console.log("🧠 Initializing root agent...");

  const { runner } = await getRootAgent();

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
    } catch (err: any) {
      console.error("❌ Agent error:", err);

      const msg = String(err?.message ?? err);
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        return res.status(429).json({
          error:
            "Gemini API quota exceeded. Please wait a bit or reduce the number of requests.",
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
    res.sendFile(path.join(publicPath, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`🌐 AgentFlow UI: http://localhost:${PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error("❌ Failed to start server:", e);
  process.exit(1);
});
