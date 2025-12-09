agentflow-adk-agent/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── node_modules/
├── public/
│   ├── index.html
│   └── app.js
└── src/
    ├── env.ts
    ├── index.ts          # (optional CLI demo)
    ├── server.ts         # 🌐 Express + ADK API + static UI
    └── agents/
        ├── agent.ts
        ├── research-agent/
        │   ├── tools.ts
        │   └── agent.ts
        └── alert-agent/
            ├── tools.ts
            └── agent.ts
