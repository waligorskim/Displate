# Trend Tool - Developer Documentation

> Version: 1.0
> Last Updated: December 17, 2024
> For: Engineers implementing or maintaining the Trend Intelligence System

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [n8n Workflow Structure](#2-n8n-workflow-structure)
3. [BigQuery Queries](#3-bigquery-queries)
4. [LLM Prompts](#4-llm-prompts)
5. [Slack Integration](#5-slack-integration)
6. [Database Schema](#6-database-schema)
7. [URL Templates](#7-url-templates)
8. [Environment Setup](#8-environment-setup)
9. [Testing](#9-testing)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

### System Components

```
┌──────────────────────────────────────────────────────────────────┐
│                         n8n Instance                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Weekly    │  │   Button    │  │   Chatbot   │               │
│  │   Report    │  │   Handler   │  │   Agent     │               │
│  │   Workflow  │  │   Workflow  │  │   Workflow  │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
└─────────┼────────────────┼────────────────┼──────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│    BigQuery     │  │   Postgres  │  │    Slack    │
│  (Trends Data)  │  │  (Actions)  │  │    (I/O)    │
└─────────────────┘  └─────────────┘  └─────────────┘
```

### Data Flow (Weekly Report)

```
Schedule Trigger (Tue 11:00)
    │
    ▼
BigQuery: Fetch Trends ────────────────────────┐
    │                                          │
    ▼                                          │
Loop: For each trend                           │
    │                                          │
    ├──► LLM: Enrich (extract IP, characters)  │
    │                                          │
    ├──► LLM: Score relevance                  │
    │                                          │
    ├──► BigQuery: GA4 search demand           │
    │                                          │
    ├──► API: Marketplace count                │
    │                                          │
    ├──► DB: Validation queue count            │
    │                                          │
    ├──► DB: Brand catalog lookup              │
    │                                          │
    └──► Calculate gap assessment              │
                                               │
    ▼                                          │
Aggregate results ◄────────────────────────────┘
    │
    ▼
Format Slack message (Block Kit)
    │
    ▼
Post to Slack channel
    │
    ▼
Save report to Postgres
```

---

## 2. n8n Workflow Structure

### Workflow: `trend_tool_weekly_report`

**Trigger:** Schedule (Cron: `0 11 * * 2`)

**Nodes:**

| Node | Type | Purpose |
|------|------|---------|
| `Schedule Trigger` | n8n-nodes-base.scheduleTrigger | Tuesday 11:00 UTC |
| `Fetch Trends` | n8n-nodes-base.googleBigQuery | Get last 7 days of trends |
| `Split Batches` | n8n-nodes-base.splitInBatches | Process trends individually |
| `Trend Enricher` | @n8n/n8n-nodes-langchain.lmChatGoogleVertex | Extract metadata |
| `Relevance Classifier` | @n8n/n8n-nodes-langchain.lmChatGoogleVertex | Score relevance |
| `GA4 Search Lookup` | n8n-nodes-base.googleBigQuery | Internal demand |
| `Marketplace Search` | n8n-nodes-base.httpRequest | Artwork count |
| `Validation Queue` | n8n-nodes-base.postgres | Pending count |
| `Brand Lookup` | n8n-nodes-base.postgres | License status |
| `Gap Calculator` | n8n-nodes-base.code | Demand-supply scoring |
| `Aggregate Results` | n8n-nodes-base.aggregate | Combine all trends |
| `Format Message` | n8n-nodes-base.code | Build Slack blocks |
| `Post to Slack` | n8n-nodes-base.slack | Send report |
| `Save Report` | n8n-nodes-base.postgres | Archive to DB |

### Workflow: `trend_tool_button_handler`

**Trigger:** Webhook (Slack interactivity)

**Nodes:**

| Node | Type | Purpose |
|------|------|---------|
| `Webhook` | n8n-nodes-base.webhook | Receive button clicks |
| `Parse Payload` | n8n-nodes-base.code | Extract action + user |
| `Route Action` | n8n-nodes-base.switch | Branch by action type |
| `Save Action` | n8n-nodes-base.postgres | Log to database |
| `Update Message` | n8n-nodes-base.slack | Modify original message |
| `Send Confirmation` | n8n-nodes-base.slack | Ephemeral response |

### Workflow: `trend_tool_chatbot`

**Trigger:** Slack event (app_mention, message)

**Nodes:**

| Node | Type | Purpose |
|------|------|---------|
| `Slack Trigger` | n8n-nodes-base.slackTrigger | Listen for mentions |
| `Parse Request` | n8n-nodes-base.code | Extract question |
| `Load Memory` | n8n-nodes-base.postgres | Thread context |
| `Agent` | @n8n/n8n-nodes-langchain.agent | LLM with tools |
| `Tool: BigQuery` | @n8n/n8n-nodes-langchain.toolWorkflow | Query trends |
| `Tool: Search Reports` | @n8n/n8n-nodes-langchain.toolWorkflow | Find past reports |
| `Save Memory` | n8n-nodes-base.postgres | Persist context |
| `Reply` | n8n-nodes-base.slack | Post response |

---

## 3. BigQuery Queries

### 3.1 Fetch Trends (Weekly Report)

```sql
-- Node: Fetch Trends
SELECT
  trend_name,
  category,
  score,
  growth_7d,
  first_seen_date,
  snapshot_date,
  DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) AS trend_age_days
FROM `analytics-324613.trendtool_export.google_trends_enriched`
WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND category IN ('GAMES', 'MOVIES', 'TV_SERIES', 'MANGA_ANIME')
  AND score >= 50
ORDER BY score DESC, growth_7d DESC
LIMIT 50
```

### 3.2 GA4 Internal Search Demand

```sql
-- Node: GA4 Search Lookup
-- Parameters: @search_terms (comma-separated list from enricher)
WITH search_data AS (
  SELECT
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') AS search_term,
    user_pseudo_id,
    event_timestamp
  FROM `analytics-324613.analytics_374261714.events_*`
  WHERE event_name = 'search'
    AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
),
aggregated AS (
  SELECT
    search_term,
    COUNT(*) AS search_count,
    COUNT(DISTINCT user_pseudo_id) AS unique_searchers
  FROM search_data
  WHERE search_term IS NOT NULL
  GROUP BY search_term
)
SELECT
  search_term,
  search_count,
  unique_searchers,
  RANK() OVER (ORDER BY search_count DESC) AS search_rank
FROM aggregated
WHERE LOWER(search_term) IN UNNEST(@search_terms)
ORDER BY search_count DESC
```

### 3.3 Brand Catalog Lookup

```sql
-- Node: Brand Lookup (if using BigQuery)
SELECT
  brand_name,
  has_license,
  brandshop_url,
  aliases
FROM `analytics-324613.trendtool_export.brand_catalog`
WHERE LOWER(brand_name) = LOWER(@ip_name)
   OR LOWER(@ip_name) IN UNNEST(aliases)
LIMIT 1
```

---

## 4. LLM Prompts

### 4.1 Trend Enricher Prompt

```
You are an entertainment metadata extraction system for Displate, a company selling metal poster artwork.

Given a trending topic name and its category, extract structured metadata.

INPUT:
- Trend name: {{$json.trend_name}}
- Category: {{$json.category}}

OUTPUT FORMAT (JSON only, no explanation):
{
  "ip_name": "Official IP/franchise name",
  "universe": "Broader universe if applicable (e.g., 'Marvel Cinematic Universe', 'Soulsborne')",
  "publisher": "Publisher/studio/developer",
  "characters": ["Main character 1", "Main character 2"],
  "themes": ["visual theme 1", "visual theme 2", "visual theme 3"],
  "content_type": "game|movie|tv_series|anime|manga|game_expansion|movie_sequel|etc",
  "search_terms": ["search term 1", "search term 2", "search term 3"]
}

RULES:
1. ip_name should be the canonical name (e.g., "Elden Ring" not "ELDEN RING DLC")
2. characters should be visually recognizable characters suitable for poster art
3. themes should describe visual/aesthetic elements (e.g., "dark fantasy", "neon", "cyberpunk")
4. search_terms should include variations customers might search for
5. If uncertain about a field, use null
6. Return ONLY valid JSON, no markdown formatting
```

### 4.2 Relevance Classifier Prompt

```
You are a content relevance classifier for Displate, a company selling metal poster artwork to fans of gaming, anime, sci-fi, and fantasy.

Evaluate how relevant this trend is to Displate's core audience.

INPUT:
{{$json.enriched_trend}}

SCORING CRITERIA:
- 9-10: Perfect fit - Gaming, anime, sci-fi, fantasy with strong visual potential
- 7-8: Good fit - Movies/TV with visual merchandising appeal, adjacent fandoms
- 5-6: Marginal fit - General pop culture, some visual potential
- 3-4: Poor fit - Limited visual appeal or niche audience
- 1-2: No fit - Sports, news, politics, non-visual content

OUTPUT FORMAT (JSON only):
{
  "relevance_score": <1-10>,
  "relevance_reasoning": "Brief explanation of score",
  "recommended_action": "HIGH_PRIORITY|MONITOR|LOW_PRIORITY|SKIP"
}

RULES:
1. Gaming and anime content should generally score 8+
2. Live-action content needs strong visual/aesthetic appeal to score above 7
3. Sports should always score below 5
4. Consider poster art potential, not just popularity
5. Return ONLY valid JSON
```

### 4.3 Chatbot System Prompt

```
You are TrendBot, an AI assistant for Displate's Trend Intelligence System.

You help team members understand:
- What's trending in gaming, movies, TV, and anime
- Whether Displate has products/licenses for trending IPs
- Historical trend data and patterns

CAPABILITIES:
- Query BigQuery for trend data
- Search past reports
- Explain gap assessments

PERSONALITY:
- Concise and direct
- Data-driven
- Helpful but not verbose

LIMITATIONS:
- Cannot access external websites
- Cannot make licensing decisions
- Cannot modify data, only read

When asked about trends, always include:
1. The trend score and growth
2. Internal search demand if available
3. Current inventory status
4. License status
5. Gap assessment

Format responses for Slack (use emoji, keep paragraphs short).
```

---

## 5. Slack Integration

### 5.1 Block Kit Message Template

```javascript
// Node: Format Message (Code node)
const trends = $input.all();

const blocks = [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "📊 TREND INTELLIGENCE REPORT",
      emoji: true
    }
  },
  {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      }
    ]
  },
  { type: "divider" }
];

for (const trend of trends) {
  const categoryEmoji = {
    'GAMES': '🎮',
    'MOVIES': '🎬',
    'TV_SERIES': '📺',
    'MANGA_ANIME': '🎌'
  }[trend.category] || '📊';
  
  const gapEmoji = trend.gap_assessment === 'HIGH_OPPORTUNITY' ? '🔥' : 
                   trend.gap_assessment === 'WELL_COVERED' ? '✅' : '👁️';
  
  blocks.push(
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${categoryEmoji} ${trend.category}* | *${trend.ip_name}*\n\n` +
              `📈 External: ${trend.score} (${trend.growth_7d > 0 ? '+' : ''}${trend.growth_7d}% 7d)\n` +
              `🔍 Internal: ${trend.internal_demand?.search_volume_30d || 'N/A'} searches\n` +
              `📦 Supply: ${trend.supply?.marketplace_count || 0} live | ${trend.supply?.validation_queue || 0} pending\n` +
              `${trend.coverage?.has_brand ? '✅' : '❌'} Brand: ${trend.coverage?.has_brand ? 'Licensed' : 'No license'}\n\n` +
              `⏱️ Trending for: ${trend.trend_age_days} days\n` +
              `🎯 Gap: ${trend.gap_assessment} ${gapEmoji}`
      }
    },
    {
      type: "actions",
      block_id: `actions_${trend.trend_id}`,
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "I'm on it", emoji: true },
          value: JSON.stringify({ trend_id: trend.trend_id, action: 'claimed' }),
          action_id: "trend_claimed"
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Reach out", emoji: true },
          value: JSON.stringify({ trend_id: trend.trend_id, action: 'outreach' }),
          action_id: "trend_outreach"
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Not for us", emoji: true },
          value: JSON.stringify({ trend_id: trend.trend_id, action: 'dismissed' }),
          action_id: "trend_dismissed"
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Snooze 7d", emoji: true },
          value: JSON.stringify({ trend_id: trend.trend_id, action: 'snoozed' }),
          action_id: "trend_snoozed"
        }
      ]
    },
    { type: "divider" }
  );
}

return { blocks };
```

### 5.2 Button Handler Webhook

**Webhook URL:** `https://n8n.displate.com/webhook/trend-tool-buttons`

**Payload structure (from Slack):**

```json
{
  "type": "block_actions",
  "user": {
    "id": "U12345678",
    "username": "mwaligora",
    "name": "Mateusz Waligóra"
  },
  "actions": [
    {
      "action_id": "trend_claimed",
      "block_id": "actions_trend_123",
      "value": "{\"trend_id\":\"trend_123\",\"action\":\"claimed\"}"
    }
  ],
  "message": {
    "ts": "1702800000.000000"
  },
  "channel": {
    "id": "C12345678"
  }
}
```

### 5.3 Slack App Configuration

**Required scopes:**
- `chat:write`
- `chat:write.public`
- `commands`
- `app_mentions:read`
- `channels:history`
- `groups:history`
- `im:history`
- `mpim:history`

**Interactivity:**
- Enable: Yes
- Request URL: `https://n8n.displate.com/webhook/trend-tool-buttons`

**Slash Commands:**
- `/trends` → `https://n8n.displate.com/webhook/trend-tool-slash`

---

## 6. Database Schema

### 6.1 Postgres Tables

```sql
-- Action tracking
CREATE TABLE ttool.trend_actions (
  id SERIAL PRIMARY KEY,
  trend_id VARCHAR(255) NOT NULL,
  trend_name VARCHAR(500) NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('claimed', 'outreach', 'dismissed', 'snoozed')),
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

-- Report history
CREATE TABLE ttool.trend_tool_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  report_content JSONB NOT NULL,
  trends_count INT,
  categories JSONB,
  slack_message_ts VARCHAR(50),
  slack_channel_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_date ON ttool.trend_tool_reports(report_date);

-- Chat memory
CREATE TABLE ttool.trend_tool_chat_memory (
  id SERIAL PRIMARY KEY,
  thread_ts VARCHAR(50) NOT NULL,
  channel_id VARCHAR(50) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

CREATE UNIQUE INDEX idx_chat_memory_thread ON ttool.trend_tool_chat_memory(thread_ts, channel_id);

-- Brand catalog (if not in BigQuery)
CREATE TABLE ttool.brand_catalog (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  has_license BOOLEAN DEFAULT FALSE,
  brandshop_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand_name ON ttool.brand_catalog(LOWER(brand_name));
```

### 6.2 Common Queries

```sql
-- Get recent actions for a trend
SELECT * FROM ttool.trend_actions
WHERE trend_id = $1
ORDER BY created_at DESC
LIMIT 10;

-- Check if trend is snoozed
SELECT * FROM ttool.trend_actions
WHERE trend_id = $1
  AND action_type = 'snoozed'
  AND snooze_until > CURRENT_TIMESTAMP
LIMIT 1;

-- Get user's claimed trends
SELECT * FROM ttool.trend_actions
WHERE user_id = $1
  AND action_type = 'claimed'
  AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY created_at DESC;
```

---

## 7. URL Templates

### 7.1 URL Generation Functions

```javascript
// Node: Code - URL Generator

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function encodeForUrl(text) {
  return encodeURIComponent(text);
}

const urlTemplates = {
  displateSearch: (query) => 
    `https://displate.com/sr-${slugify(query)}`,
  
  displateBrandshop: (brandSlug) => 
    `https://displate.com/brand/${brandSlug}`,
  
  displateArtwork: (artworkId) => 
    `https://displate.com/displate/${artworkId}`,
  
  redbubble: (query) => 
    `https://www.redbubble.com/shop/?query=${encodeForUrl(query)}`,
  
  deviantart: (query) => 
    `https://www.deviantart.com/search?q=${encodeForUrl(query)}`,
  
  artstation: (query) => 
    `https://www.artstation.com/search?query=${encodeForUrl(query)}`,
  
  allposters: (query) => 
    `https://www.allposters.com/-st/${encodeForUrl(query)}-Posters_c.htm`
};

// Generate all links for a trend
function generateLinks(trend) {
  const query = trend.ip_name;
  return {
    displate: urlTemplates.displateSearch(query),
    brandshop: trend.brandshop_url || null,
    redbubble: urlTemplates.redbubble(query),
    deviantart: urlTemplates.deviantart(query),
    artstation: urlTemplates.artstation(query),
    allposters: urlTemplates.allposters(query)
  };
}

return { links: generateLinks($input.item.json) };
```

---

## 8. Environment Setup

### 8.1 Required Credentials (n8n)

| Credential | Type | Notes |
|------------|------|-------|
| `BigQuery` | Google BigQuery | Service account with read access to `analytics-324613` |
| `Postgres` | PostgreSQL | Connection to `ttool` schema |
| `Slack` | Slack OAuth | Bot token with required scopes |
| `Vertex AI` | Google Cloud | Service account for Gemini API |

### 8.2 Environment Variables

```bash
# n8n instance
N8N_HOST=n8n.displate.com
N8N_PROTOCOL=https
N8N_PORT=443

# Webhook base URL
WEBHOOK_URL=https://n8n.displate.com/webhook

# Database
POSTGRES_HOST=your-postgres-host
POSTGRES_DB=displate
POSTGRES_SCHEMA=ttool

# Google Cloud
GCP_PROJECT_ID=analytics-324613
GCP_LOCATION=europe-west1
```

### 8.3 GCP Service Account Permissions

```
# BigQuery
bigquery.jobs.create
bigquery.tables.getData
bigquery.tables.list

# Vertex AI
aiplatform.endpoints.predict
```

---

## 9. Testing

### 9.1 Unit Tests

**Enricher output validation:**
```javascript
const schema = {
  ip_name: { type: 'string', required: true },
  universe: { type: 'string', nullable: true },
  publisher: { type: 'string', nullable: true },
  characters: { type: 'array', items: 'string' },
  themes: { type: 'array', items: 'string' },
  content_type: { type: 'string', required: true },
  search_terms: { type: 'array', items: 'string', required: true }
};
```

**Gap calculator test cases:**
```javascript
const testCases = [
  {
    input: { external: 90, internal: 3000, supply: 5, hasBrand: false },
    expected: 'HIGH_OPPORTUNITY'
  },
  {
    input: { external: 90, internal: 3000, supply: 200, hasBrand: true },
    expected: 'WELL_COVERED'
  },
  {
    input: { external: 90, internal: 50, supply: 0, hasBrand: false },
    expected: 'MONITOR'
  }
];
```

### 9.2 Integration Tests

1. **Weekly report flow:** Trigger manually, verify Slack output
2. **Button handler:** Click button, verify database record
3. **Chatbot:** Send message, verify response

### 9.3 Test Channels

- **Development:** `#tmp_trend_tool_dev`
- **Staging:** `#tmp_trend_tool_v2`
- **Production:** `#trend-intelligence`

---

## 10. Troubleshooting

### 10.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No trends in report | BigQuery empty or filter too strict | Check query, lower score threshold |
| LLM returns invalid JSON | Model hallucination | Add JSON validation, retry on failure |
| Buttons don't work | Webhook URL mismatch | Verify Slack app interactivity URL |
| Chatbot timeout | Query too slow | Add pagination, optimize queries |
| Missing search data | GA4 export delay | Check BigQuery export freshness |

### 10.2 Logs

**n8n execution logs:**
- Access: n8n UI → Executions
- Filter by workflow name

**Error notifications:**
- Slack channel: `#n8n-errors`
- Email: (configure in n8n settings)

### 10.3 Monitoring

**Key metrics to track:**
- Weekly report delivery success rate
- Average report generation time
- Button click-through rate
- Chatbot response time

---

## Appendix A: Node Configuration Examples

### A.1 BigQuery Node

```json
{
  "operation": "executeQuery",
  "projectId": "analytics-324613",
  "sqlQuery": "SELECT * FROM ...",
  "options": {
    "location": "europe-west2"
  }
}
```

### A.2 Vertex AI Chat Node

```json
{
  "modelId": "gemini-1.5-flash",
  "projectId": "analytics-324613",
  "region": "europe-west1",
  "temperature": 0.3,
  "maxOutputTokens": 1024
}
```

### A.3 Slack Node

```json
{
  "operation": "postMessage",
  "channel": "C12345678",
  "blocksUi": "{{ $json.blocks }}",
  "options": {
    "unfurl_links": false,
    "unfurl_media": false
  }
}
```
