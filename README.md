# αResearch Terminal

An AI-powered equity research dashboard built for the UMD Agentic AI Challenge 2026. Enter a stock ticker and a multi-agent pipeline analyzes the latest earnings transcript, surfaces key signals, and compiles a structured research report — in under two minutes.

## What it does

**Input:** A stock ticker (e.g. `AMZN`, `GOOG`, `META`)

**Output:** A full research report with four sections:

| Section | Description |
|---|---|
| Executive Summary | Key metrics, headline takeaway with bolded drivers, and forward guidance |
| Key Insights | Bullish / bearish / neutral signals extracted from the transcript |
| Delta vs. Last Quarter | What changed, what was dropped, and tone shifts vs. the prior call |
| Industry & Thematic Trends | Cross-transcript themes sourced from peer earnings calls |

## Architecture

The frontend sends a POST request to an **n8n webhook** with the ticker and a session ID. n8n orchestrates a multi-agent workflow:

1. Fetches and parses the most recent earnings call transcript
2. Pulls stock fundamentals and peer transcripts
3. Runs Claude to assess management sentiment and extract signals
4. Builds the quarter-over-quarter delta analysis
5. Returns structured JSON consumed directly by the UI

The frontend never does any AI inference — it's a pure render layer over the agent output.

## JSON contract

The webhook returns:

```json
[{
  "output": {
    "ticker": "AMZN",
    "quarter": "Q4 2025",
    "executive_summary": {
      "beat_miss": "beat",
      "metrics": [{ "label": "...", "value": "...", "yoy_change": "..." }],
      "headline_takeaway": "...",
      "key_drivers": ["AWS acceleration", "custom chips"],
      "primary_driver": "...",
      "forward_guidance": "..."
    },
    "key_insights": [{ "signal": "bullish|bearish|neutral", "title": "...", "detail": "..." }],
    "delta_vs_last_quarter": {
      "comparison": "Q4 2025 vs Q3 2025",
      "changes": [{ "type": "new|tone_shift|metric_change|dropped|unchanged", "title": "...", "detail": "..." }]
    },
    "industry_trends": {
      "themes": [{ "category": "dominant|emerging|persistent", "title": "...", "detail": "...", "mentioned_by": ["AMZN"] }],
      "sources": ["AMZN Q4'25"]
    }
  }
}]
```

`key_drivers` phrases are automatically bolded inside `headline_takeaway` in the UI.

## Stack

- **Frontend:** React + Vite
- **Orchestration:** n8n (self-hosted)
- **AI:** Claude (Anthropic) via n8n agents
- **Fonts:** Playfair Display · IBM Plex Mono · DM Sans

## Running locally

```bash
npm install
npm run dev
```
