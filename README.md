# Displate Trend Intelligence Tool

AI-powered trend monitoring system that identifies emerging pop culture opportunities by analyzing Google Trends data and matching against Displate's internal demand signals.

## Quick Start

1. **Import workflow**: In n8n, go to Workflows → Import from File → select `trend_tool_workflow_phase2.json`
2. **Configure credentials**: Update BigQuery, Vertex AI, Slack, and Postgres credential IDs
3. **Test run**: Execute manually to validate data flow
4. **Activate schedule**: Workflow runs Tuesdays at 11:00 UTC

## Files

| File | Purpose |
|------|---------|
| `trend_tool_workflow_phase2.json` | Importable n8n workflow (Phase 2) |
| `phase2_implementation.md` | Implementation details: queries, prompts, JS functions |
| `displate_trend_intelligence_system_spec_v3.md` | Full system specification |
| `trend_tool_roadmap.md` | 4-phase development roadmap |
| `trend_tool_developer_docs.md` | Technical deep-dive for developers |
| `trend_tool_executive_summary.md` | One-pager for stakeholders |

## Architecture

```
Google Trends → BigQuery → LLM Enrichment → Relevance Filter → 
GA4 Search Match → Gap Analysis → Slack (#tmp_trend_tool_v2)
```

## Key Features (Phase 2)

- **Multi-category**: Games, Movies, TV Series, Manga/Anime
- **LLM Pipeline**: Gemini-powered metadata extraction + relevance scoring
- **Demand-Supply Gap**: Matches external trends to internal search volume
- **Smart Routing**: Only surfaces trends with Displate relevance ≥50

## Pending (Need Data Sources)

- Brand catalog lookup (need BizDev brand list)
- Marketplace inventory count (need Algolia API)
- Validation queue status (need admin API access)

## Contact

Questions? Reach out to Mateusz Waligórski or post in #analytics-data-and-reports
