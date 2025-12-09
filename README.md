# 🤖 AgentFlow – DeFi AI Agent (Built with ADK-TS)

**Natural language in. DeFi strategies, risk analysis & backtests out.**  
AgentFlow is an AI-powered DeFi assistant built with **IQAI’s ADK-TS (Agent Development Kit – TypeScript)**.  
It helps users understand BTC/ETH markets, manage risk, and simulate simple trading rules — all from a beautiful, single-page chat interface.

---

## 🔗 Live Links

- 🌐 **Live Demo (Render)**: https://agentflow-adk-agent.onrender.com  
- 🧠 **Built for**: AGENT ARENA – AI Agent Hackathon (IQAI + ADK-TS track)  
- 💻 **GitHub Repo**: https://github.com/sahu-virendra-1908/Agentflow_adk_agent  
- 🎬 **Demo Video**: _TODO: Add YouTube link here when ready_  
- 🚀 **ATP Agent Link**: _TODO: Add IQAI ATP launch link after deployment_

---

## 🧩 What is AgentFlow?

AgentFlow is a **multi-agent DeFi copilot**.  
User just types in natural language:

> “Give me a BTC & ETH overview and explain the risk for a low-risk investor.”  
> “Alert me when BTC goes above 80,000 USD.”  
> “Analyze my portfolio risk: 60% BTC, 25% ETH, 10% USDC, 5% meme coins.”  
> “Backtest this rule: buy ETH when it drops 5% over the last 90 days, starting with 1000 USD.”

…and the agent:

- Routes the query to the **right sub-agent** using ADK-TS
- Calls tools to fetch market data or historical prices
- Returns a clean, human-readable answer (and for backtests, a mini chart in the UI)

This is designed as a **practical DeFi assistant** rather than just a chatbot:  
it combines **education (research)**, **automation (alerts)**, **risk awareness (portfolio)** and **light quant analysis (backtests)** in one place.

---

## ✨ Key Features

### 1. Natural Language DeFi Assistant

- Ask anything about **BTC / ETH market**, volatility, risk, or basic DeFi concepts
- The agent responds in simple language, suitable even for **new DeFi users**
- Example:
  - “Explain DeFi risk in simple terms for a beginner.”
  - “Suggest a safe BTC/ETH split for a low-risk investor.”

---

### 2. Multi-Agent Architecture (ADK-TS)

AgentFlow is powered by a **root router agent** plus multiple specialized sub-agents:

1. 🔍 **Research Agent**
   - Handles market overview & explanations  
   - Use case:  
     > “Give me a short BTC and ETH market overview and explain the risk for a low-risk investor.”

2. ⚙️ **Alert Agent**
   - Turns natural language into **simple alert rules**  
   - Example:  
     > “Alert me when BTC goes above 80,000 USD.”  
   - For the hackathon demo, alerts are mocked / logged via the backend instead of full on-chain automation.

3. 🧮 **Portfolio Risk Agent**
   - Analyzes simple portfolio breakdowns (e.g. 60% BTC, 25% ETH, 10% USDC, 5% meme coins)
   - Computes & explains:
     - concentration risk
     - stablecoin vs volatile exposure
     - meme/long-tail risk
   - Returns a simple rating:
     - 🟢 Low risk  
     - 🟡 Medium risk  
     - 🔴 High risk  
   - Tailored to the user’s risk profile (e.g. “I am a low-risk investor”).

4. 📈 **Backtest Agent**
   - Backtests a **very simple spot strategy** using historical data
   - Example prompt:
     > “Backtest this rule: buy ETH when it drops 5% over the last 90 days, starting with 1000 USD.”
   - The tool:
     - fetches historical daily prices (e.g. from CoinGecko)
     - simulates: “if today’s close is 5% below yesterday, buy, then sell next day”
     - returns:
       - number of trades  
       - final equity  
       - total return %  
       - per-trade PnL  
       - a series usable for a mini chart in the frontend

This multi-agent structure is orchestrated through **ADK-TS**.

---

### 3. Futuristic, Single-Page UI 


- Features:
  - Dark, aurora-style card for the chat
  - “Quick Ideas” panel with one-click prompts:
    - 📊 BTC & ETH Overview  
    - 🔔 BTC Price Alert  
    - 📉 ETH APY Alert  
    - 🧠 Explain DeFi Risk  
    - 🧮 Analyze Portfolio Risk  
    - 📈 Backtest ETH 5% Dip Strategy  
  - Status pill: “Connected to AgentFlow backend”
  - Responsive layout: looks good on both desktop and mobile

For backtests, the UI includes a **Backtest Result** panel with a small chart canvas (JS-rendered) to visualize the equity curve or price series.

---

## 🧠 How We Use ADK-TS (For Hackathon Judges)

This section is specifically for:  
> _“Explanation of how you used ADK-TS or OM1 specifically for this hackathon.”_  

AgentFlow is built **only on ADK-TS**, not OM1.

### 1. Root Agent & Multi-Agent Graph

- A **root agent** (created using ADK-TS) receives the final user message from the Express backend.
- The root agent:
  - Uses the LLM (Gemini model via ADK’s LLM abstraction) to **understand intent**
  - Routes the request to one of:
    - Research Agent
    - Alert Agent
    - Portfolio Agent
    - Backtest Agent

This is implemented using ADK’s **AutoFlow / LlmAgent orchestration** patterns (from `@iqai/adk`).

### 2. Tools via `createTool`

Each sub-agent exposes structured tools written in TypeScript and Zod, for example:

- **Backtest Tool**
  - Defined with `createTool`  
  - Uses a `zod` schema:
    - `asset` (e.g. "ETH")
    - `lookbackDays`
    - `dropPercent`
    - `initialCapital`
  - ADK-TS:
    - parses the LLM’s tool call arguments
    - validates using Zod
    - passes typed params into the tool function

- **Portfolio Risk Tool**
  - Parses user-provided portfolio weights and risk profile
  - Computes simple ratios and returns a **typed JSON result**  
  - LLM then converts that into friendly explanation.

### 3. TypeScript-First DX

- All agents, tools, and schemas are written in **TypeScript**
- ADK-TS abstractions (LlmAgent, tools, flows) give:
  - type safety
  - clean separation between **LLM**, **reasoning**, and **DeFi data calls**
- This also makes it easy to extend:
  - new agents (e.g. “Strategy Generator Agent”)
  - new tools (e.g. “multi-asset portfolio optimizer”)

### 4. Stateless Frontend, Stateful Agent

The frontend is **dumb** (just UI), while the “brain” lives in ADK:

- No complex React state machines
- No manual tool invocation from UI
- Everything from:
  - routing  
  - prompt handling  
  - tool usage  
is controlled through **ADK-TS** on the backend.

---

## 🏗️ Architecture Overview

```text
Browser (Tailwind UI, static HTML + JS)
          │
          ▼
Express Server (Node.js, TypeScript)
 - Serves /public (index.html, app.js, styles.css)
 - Exposes POST /api/ask
          │
          ▼
ADK-TS Root Agent
 - LlmAgent (Gemini via ADK)
 - Agent graph:
      - Research Agent
      - Alert Agent
      - Portfolio Agent
      - Backtest Agent
          │
          ▼
Tools & External APIs
 - Market data / price history (e.g. CoinGecko)
 - Simple in-memory / mock alert registry
