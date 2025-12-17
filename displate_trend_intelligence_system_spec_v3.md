# Displate Trend Intelligence System - Technical Specification v3

> Version: 3.0
> Last Updated: 2024-12-17
> Owner: Mateusz Waligóra
> Status: APPROVED

---

## 1. Executive Summary

The Trend Intelligence System monitors external signals (Google Trends), correlates them with internal demand (GA4 search data) and supply (marketplace inventory), and delivers actionable insights via Slack with interactive buttons for accountability tracking.

**Key capabilities:**
- Multi-category trend monitoring (Games, Movies, TV Series, Anime/Manga)
- Demand-supply gap analysis (external signals vs internal search vs inventory)
- Cascade lookups (brand catalog, marketplace, validation queue)
- Interactive Slack reports with button-driven actions
- Conversational chatbot for ad-hoc queries

---

## 2. System Architecture

### 2.1 High-Level Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Google Trends  │────▶│   BigQuery ETL  │────▶│  Enriched Data  │
│    (External)   │     │     (dbt)       │     │    (Staging)    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐                                      ▼
│   GA4 Search    │─────────────────────────────▶┌─────────────────┐
│   (Internal)    │                              │   n8n Workflow  │
└─────────────────┘                              │   (Orchestrator)│
                                                 └────────┬────────┘
┌─────────────────┐                                      │
│ Brand Catalog   │◀─────────────────────────────────────┤
│ Marketplace     │◀─────────────────────────────────────┤
│ Validation Queue│◀─────────────────────────────────────┤
└─────────────────┘                                      │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Slack Output   │
                                               │  (Interactive)  │
                                               └─────────────────┘
```

### 2.2 Component Ownership

| Component | Owner | Technology |
|-----------|-------|------------|
| Google Trends ingestion | Bartosz Klocek | dbt + BigQuery |
| GA4 search data | Bartosz Klocek | BigQuery export |
| Trend enrichment (LLM) | Waligóra | n8n + Gemini |
| Cascade logic | Waligóra | n8n |
| Slack output | Waligóra | n8n + Slack API |
| Action tracking | Waligóra | n8n + Postgres |
| Chatbot | Waligóra | n8n + Gemini |

---

## 3. Data Sources

### 3.1 Google Trends (Primary Signal)

**Source:** `analytics-324613.trendtool_export.google_trends_enriched`

| Field | Type | Description |
|-------|------|-------------|
| `trend_name` | STRING | Raw trend name from Google |
| `category` | STRING | GAMES, MOVIES, TV_SERIES, MANGA_ANIME |
| `score` | INT64 | Google Trends score (0-100) |
| `growth_7d` | FLOAT64 | 7-day growth percentage |
| `first_seen_date` | DATE | First appearance in dataset |
| `snapshot_date` | DATE | Data collection date |

**Derived field (calculated in n8n):**
```sql
DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) AS trend_age_days
```

### 3.2 GA4 Internal Search (Demand Signal)

**Source:** `analytics-324613.analytics_374261714.events_*`

| Field | Type | Description |
|-------|------|-------------|
| `event_name` | STRING | Filter: `search` |
| `event_params.search_term` | STRING | User search query |
| `event_timestamp` | INT64 | Microsecond timestamp |
| `user_pseudo_id` | STRING | Anonymous user ID |

**Aggregation query:**
```sql
SELECT
  search_term,
  COUNT(*) AS search_count_30d,
  COUNT(DISTINCT user_pseudo_id) AS unique_searchers_30d
FROM `analytics-324613.analytics_374261714.events_*`
WHERE event_name = 'search'
  AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
GROUP BY search_term
ORDER BY search_count_30d DESC
```

### 3.3 Brand Catalog (Coverage Signal)

**Source:** TBD - BigQuery table or manual mapping

| Field | Type | Description |
|-------|------|-------------|
| `brand_name` | STRING | Official brand/IP name |
| `aliases` | ARRAY<STRING> | Alternative names |
| `has_license` | BOOLEAN | Active license status |
| `brandshop_url` | STRING | Displate brandshop URL if exists |

### 3.4 Marketplace Inventory (Supply Signal)

**Source:** Algolia search API or internal search endpoint

| Field | Type | Description |
|-------|------|-------------|
| `query` | STRING | Search term |
| `total_results` | INT64 | Number of matching artworks |
| `top_results` | ARRAY | Sample artwork IDs |

### 3.5 Validation Queue (Pending Supply)

**Source:** Admin panel API or direct Postgres query (TBD)

| Field | Type | Description |
|-------|------|-------------|
| `query` | STRING | Search term |
| `pending_count` | INT64 | Artworks awaiting validation |

---

## 4. Processing Pipeline

### 4.1 LLM Nodes

#### Node 1: `trend_enricher`

**Purpose:** Extract structured metadata from raw trend names

**Input:**
```json
{
  "trend_name": "Elden Ring DLC",
  "category": "GAMES"
}
```

**Output:**
```json
{
  "ip_name": "Elden Ring",
  "universe": "Soulsborne",
  "publisher": "Bandai Namco / FromSoftware",
  "characters": ["Tarnished", "Messmer", "Miquella"],
  "themes": ["dark fantasy", "open world", "RPG", "boss battles"],
  "content_type": "game_expansion",
  "search_terms": ["elden ring", "elden ring dlc", "shadow of the erdtree", "messmer"]
}
```

**Model:** Gemini 1.5 Flash (via Vertex AI)

#### Node 2: `relevance_classifier`

**Purpose:** Score trend relevance to Displate's audience

**Input:** Enriched trend object from `trend_enricher`

**Output:**
```json
{
  "relevance_score": 8,
  "relevance_reasoning": "Dark fantasy aesthetic aligns with core Displate audience. High visual potential for poster art.",
  "recommended_action": "HIGH_PRIORITY"
}
```

**Scoring criteria:**
- 9-10: Core audience (gaming, anime, sci-fi, fantasy)
- 7-8: Adjacent audience (movies, TV with visual appeal)
- 5-6: Marginal fit (general pop culture)
- 1-4: Poor fit (sports, news, politics) → Filter out

**Soft filter:** Trends scoring <5 are excluded from report but logged for review.

### 4.2 Cascade Logic

#### Node: `internal_search_matcher`

**Purpose:** Match enriched trend to internal search queries

**Logic:**
1. Take `search_terms` array from enricher
2. Query GA4 search data for each term (fuzzy match)
3. Aggregate results

**Output:**
```json
{
  "search_volume_30d": 2400,
  "search_rank": 47,
  "top_queries": ["elden ring", "elden ring poster", "tarnished"],
  "conversion_rate": 0.023
}
```

#### Node: `demand_supply_gap_calculator`

**Purpose:** Core intelligence - correlate all signals

**Input:** All cascade results

**Output:**
```json
{
  "trend": "Elden Ring DLC",
  "external_signal": {
    "google_trends_score": 85,
    "growth_7d": "+195%"
  },
  "internal_demand": {
    "search_volume_30d": 2400,
    "search_rank": 47,
    "top_queries": ["elden ring", "elden ring poster", "tarnished"]
  },
  "supply": {
    "marketplace_count": 127,
    "validation_queue": 23
  },
  "coverage": {
    "has_brand": true,
    "brandshop_url": "https://displate.com/sr/elden-ring"
  },
  "gap_assessment": "WELL_COVERED",
  "gap_reasoning": "High demand with existing license and good inventory coverage"
}
```

**Gap Assessment Logic:**
| External | Internal | Supply | Brand | Assessment |
|----------|----------|--------|-------|------------|
| High | High | Low | No | `HIGH_OPPORTUNITY` |
| High | High | Low | Yes | `EXPAND_INVENTORY` |
| High | Low | Any | No | `MONITOR` |
| High | High | High | Yes | `WELL_COVERED` |
| Low | Any | Any | Any | `LOW_PRIORITY` |

---

## 5. Output Specification

### 5.1 Weekly Slack Report

**Schedule:** Tuesdays 11:00 UTC
**Channel:** `#trend-intelligence` (production)
**Format:** Slack Block Kit

#### Message Structure

```
📊 TREND INTELLIGENCE REPORT
Week of December 16, 2024

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 GAMES | Elden Ring DLC
━━━━━━━━━━━━━━━━━━━━━━━━

📈 External: 85 (+195% 7d)
🔍 Internal: 2,400 searches (#47 rank)
📦 Supply: 127 live | 23 pending
✅ Brand: Licensed

⏱️ Trending for: 12 days
🎯 Gap: WELL_COVERED

[🔗 Links]
• Displate: https://displate.com/sr-elden-ring
• Marketplace: https://displate.com/displate/...
• RedBubble | DeviantArt | ArtStation

[📋 Actions]
[I'm on it] [Reach out] [Not for us] [Snooze 7d]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 ANIME | Blue Lock Season 2
━━━━━━━━━━━━━━━━━━━━━━━━

📈 External: 92 (+340% 7d)
🔍 Internal: 3,100 searches (#23 rank)
📦 Supply: 5 live | 45 pending
❌ Brand: No license

⏱️ Trending for: 3 days
🎯 Gap: HIGH_OPPORTUNITY 🔥

[🔗 Links]
• Search: https://displate.com/sr-blue-lock
• Marketplace: https://displate.com/displate/...
• RedBubble | DeviantArt | ArtStation

[📋 Actions]
[I'm on it] [Reach out] [Not for us] [Snooze 7d]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5.2 Button Actions

| Button | Action | Database Record |
|--------|--------|-----------------|
| `I'm on it` | Claim ownership | `user_id`, `trend_id`, `action: claimed`, `timestamp` |
| `Reach out` | Flag for outreach | `user_id`, `trend_id`, `action: outreach`, `timestamp` |
| `Not for us` | Dismiss | `user_id`, `trend_id`, `action: dismissed`, `reason`, `timestamp` |
| `Snooze 7d` | Defer | `user_id`, `trend_id`, `action: snoozed`, `snooze_until`, `timestamp` |

### 5.3 URL Templates

| Link Type | Template |
|-----------|----------|
| Displate Search | `https://displate.com/sr-{slug}` |
| Displate Brandshop | `https://displate.com/brand/{brand_slug}` |
| Marketplace (first result) | `https://displate.com/displate/{artwork_id}` |
| RedBubble | `https://www.redbubble.com/shop/?query={encoded_query}` |
| DeviantArt | `https://www.deviantart.com/search?q={encoded_query}` |
| ArtStation | `https://www.artstation.com/search?query={encoded_query}` |
| AllPosters | `https://www.allposters.com/-st/{encoded_query}-Posters_c.htm` |

---

## 6. Chatbot Specification

### 6.1 Capabilities

| Command | Function |
|---------|----------|
| `@TrendBot` + question | Natural language query |
| `/trends today` | On-demand report for last 24h |
| `/trends research "X"` | Deep dive on specific IP |

### 6.2 Tools Available

| Tool | Description |
|------|-------------|
| `query_bigquery` | Run SQL against trends data |
| `search_reports` | Find past reports by date/trend |
| `get_cascade_data` | Fetch current cascade status for trend |

### 6.3 Memory

- **Scope:** Thread-based (conversations within same thread share context)
- **Storage:** Postgres `ttool.trend_tool_chat_memory`
- **Retention:** 30 days

---

## 7. Database Schema

### 7.1 Action Tracking Table

```sql
CREATE TABLE ttool.trend_actions (
  id SERIAL PRIMARY KEY,
  trend_id VARCHAR(255) NOT NULL,
  trend_name VARCHAR(500) NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- claimed, outreach, dismissed, snoozed
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255),
  reason TEXT,
  snooze_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  slack_message_ts VARCHAR(50),
  slack_channel_id VARCHAR(50)
);

CREATE INDEX idx_trend_actions_trend ON ttool.trend_actions(trend_id);
CREATE INDEX idx_trend_actions_user ON ttool.trend_actions(user_id);
CREATE INDEX idx_trend_actions_created ON ttool.trend_actions(created_at);
```

### 7.2 Report History Table

```sql
CREATE TABLE ttool.trend_tool_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  report_content JSONB NOT NULL,
  trends_count INT,
  categories JSONB,
  slack_message_ts VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Categories

### 8.1 Supported Categories

| Category ID | Display Name | Source Filter |
|-------------|--------------|---------------|
| `GAMES` | 🎮 Games | Google Trends: Games |
| `MOVIES` | 🎬 Movies | Google Trends: Movies |
| `TV_SERIES` | 📺 TV Series | Google Trends: TV Shows |
| `MANGA_ANIME` | 🎌 Anime & Manga | Google Trends: Anime & Manga |

### 8.2 Excluded Categories

| Category | Reason |
|----------|--------|
| Sports | High volume, low relevance, flooding risk |
| News | Time-sensitive, no visual merchandising potential |
| Politics | Brand safety concerns |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Target |
|--------|--------|
| Report generation time | < 60 seconds |
| Cascade lookup latency | < 5 seconds per trend |
| Chatbot response time | < 10 seconds |

### 9.2 Reliability

| Metric | Target |
|--------|--------|
| Weekly report delivery | 99% (< 1 miss per quarter) |
| Button handler uptime | 99.5% |

### 9.3 Data Freshness

| Data Source | Refresh Frequency |
|-------------|-------------------|
| Google Trends | Daily (via dbt) |
| GA4 Search | Real-time (24h lookback for aggregation) |
| Marketplace | On-demand (per report) |
| Validation Queue | On-demand (per report) |

---

## 10. Security & Access

### 10.1 Slack Channel Access

- **Production channel:** Restricted to BizDev + Marketplace + Leadership
- **Test channel:** Analytics team only

### 10.2 Database Access

- **Read:** All cascade queries via service account
- **Write:** Action tracking via n8n workflow only

### 10.3 API Credentials

| Service | Storage |
|---------|---------|
| BigQuery | GCP Service Account (n8n credential) |
| Slack | OAuth token (n8n credential) |
| Postgres | Connection string (n8n credential) |
| Vertex AI | GCP Service Account (n8n credential) |

---

## 11. Future Enhancements (Ice Box)

| Feature | Description | Rationale for Deferral |
|---------|-------------|------------------------|
| Hubspot integration | Sync deals/contacts for outreach tracking | Adds complexity; core cascade sufficient for MVP |
| SteamDB integration | Gaming release calendar correlation | Additional data source; not MVP |
| IMDB integration | Movie/TV metadata enrichment | Additional data source; not MVP |
| Anime DB integration | Anime-specific metadata | Additional data source; not MVP |
| Predictive trending | Forecast trend trajectories | Needs historical analysis first |
| Auto-escalation | Alert if no action taken in X days | Keep manual for now |

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2024-12-17 | Added demand-supply gap analysis; removed Hubspot (moved to Ice Box); added GA4 search integration; updated cascade logic |
| 2.0 | 2024-12-01 | Initial cascade specification |
| 1.0 | 2024-11-15 | Basic weekly report spec |
