# API Blueprint - Natural Writing (Enterprise)

This document outlines the primary API endpoints for the **Natural Writing** backend. 

## Base URL
`http://localhost:3001` (Default development)

## 🏗️ Core Rewrite Engine
`POST /rewrite/process`
- **Body**: `{ text: string, options: { tone, strength, sectionType, intent, targetGradeLevel, styleProfile } }`
- **Description**: The primary mirror pass for stylistic optimization.

`POST /rewrite/:id/synthesize`
- **Body**: `{ text: string, options: any }`
- **Description**: Triggers the **Nexus Prime** multi-model swarm synthesis (GPT, Claude, Gemini).

## 🌍 Global Nexus
`POST /rewrite/global/process`
- **Body**: `{ text: string, options: any, targetLanguage: string }`
- **Description**: Cross-lingual DNA transfer and localization.

## 🧠 Psychology & Engagement
`POST /rewrite/:id/predict-engagement`
- **Body**: `{ text: string }`
- **Description**: Generates an engagement score and fatigue heat-map.

`POST /rewrite/:id/spawn-readers`
- **Body**: `{ text: string }`
- **Description**: Simulates feedback from built-in AI reader personas.

## 📦 Publication
`GET /rewrite/:id/publish?format=md|epub|html`
- **Description**: Serializes a masterpiece into production-ready formats via the **Exodus Hub**.

## 📊 Platform Observability
`GET /rewrite/stats`
- **Description**: Returns SRE metrics, token usage, and platform performance data.

## 📂 Vault & Projects
`GET /rewrite/history` - Retrieve manuscript version history.
`GET /rewrite/projects` - Retrieve enterprise folder structures.
`POST /rewrite/projects` - Create a new project workspace.

---

## Developer Integration
For high-volume enterprise integrations, ensure your `OPENAI_API_KEY` is configured in the `.env`. The system supports concurrent swarm synthesis for professional publishing workflows.
