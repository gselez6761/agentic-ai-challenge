# αResearch Terminal

An AI-powered equity research dashboard built for the UMD Agentic AI Challenge 2026. Enter a stock ticker and a multi-agent pipeline analyzes the latest earnings transcript, surfaces key signals, and compiles a structured research report — in under two minutes.

## What it does

**Input:** A stock ticker (e.g. `AMZN`, `GOOG`, `META`)

**Output:** A full research report with four sections:

| Section | Description |
|---|---|
| Executive Summary | Key metrics, headline takeaway with bolded drivers, and forward guidance |
| Key Insights | Bullish / bearish / neutral signals extracted from the transcript |
| Industry & Thematic Trends | Cross-transcript themes sourced from peer earnings calls |
| Competitive Landscape | Segment-level revenue vs. peers, auto-ordered so data-bearing cells land on the diagonal |

## Architecture

The frontend sends a POST request to an **n8n webhook** with the ticker and a session ID. n8n orchestrates a multi-agent workflow:

1. Fetches and parses the most recent earnings call transcript
2. Pulls stock fundamentals and peer transcripts
3. Runs Claude to assess management sentiment and extract signals
4. Builds the competitive landscape from peer segment data
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
    "industry_trends": {
      "themes": [{ "category": "dominant|emerging|persistent", "title": "...", "detail": "...", "mentioned_by": ["AMZN"] }],
      "sources": ["AMZN Q4'25"]
    },
    "competitive_landscape": {
      "companies": ["AMZN", "WMT", "GOOG", "META"],
      "offerings": [{
        "category": "E-commerce / Online Retail",
        "positions": [{
          "has_segment": true,
          "segment_name": "Online stores",
          "revenue": 269300000000,
          "revenue_prior_year": 247000000000,
          "yoy_growth": 9.0
        }]
      }]
    }
  }
}]
```

`key_drivers` phrases are automatically bolded inside `headline_takeaway` in the UI.

## Stack

- **Frontend:** React + Vite
- **Orchestration:** n8n (self-hosted)
- **AI:** Claude (Anthropic) via n8n agents

## Running locally

```bash
npm install
npm run dev
```
