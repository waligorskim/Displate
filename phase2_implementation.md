# Phase 2 Implementation Package

> Ready-to-use BigQuery queries, LLM prompts, and n8n node configurations
> Last updated: 2024-12-17

---

## 2A.1: Expand Category Filter

**Current state:** Only fetching GAMES category
**Target state:** Fetch all 4 categories (GAMES, MOVIES, TV_SERIES, MANGA_ANIME)

### BigQuery Query Update

```sql
-- Replace existing trends query with this
-- Location: n8n BigQuery node "Fetch Trends"

SELECT
  trend_name,
  trend_score,
  trend_category,
  growth_7d_pct,
  first_seen_date,
  latest_refresh_date,
  -- Enrichment fields (if already populated)
  ip_name,
  universe,
  characters,
  publisher,
  themes,
  relevance_score
FROM `analytics-324613.trendtool_export.google_trends_enriched`
WHERE 
  -- Expand to all 4 categories
  trend_category IN ('GAMES', 'MOVIES', 'TV_SERIES', 'MANGA_ANIME')
  -- Only recent trends (last 7 days refresh)
  AND latest_refresh_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  -- Minimum signal threshold
  AND trend_score >= 50
ORDER BY 
  trend_score DESC,
  growth_7d_pct DESC
LIMIT 50
```

### n8n Node Config

```json
{
  "name": "Fetch Trends - All Categories",
  "type": "n8n-nodes-base.googleBigQuery",
  "parameters": {
    "operation": "executeQuery",
    "projectId": "analytics-324613",
    "sqlQuery": "SELECT trend_name, trend_score, trend_category, growth_7d_pct, first_seen_date, latest_refresh_date, ip_name, universe, characters, publisher, themes, relevance_score FROM `analytics-324613.trendtool_export.google_trends_enriched` WHERE trend_category IN ('GAMES', 'MOVIES', 'TV_SERIES', 'MANGA_ANIME') AND latest_refresh_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND trend_score >= 50 ORDER BY trend_score DESC, growth_7d_pct DESC LIMIT 50"
  }
}
```

---

## 2A.2: Add trend_age_days Calculation

**Purpose:** Show how long a trend has been active (urgency signal)

### BigQuery Query Addition

```sql
-- Add this to the SELECT clause in the trends query

SELECT
  trend_name,
  trend_score,
  trend_category,
  growth_7d_pct,
  first_seen_date,
  latest_refresh_date,
  -- NEW: Calculate days since first seen
  DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) AS trend_age_days,
  -- NEW: Urgency flag based on age
  CASE 
    WHEN DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) <= 3 THEN 'NEW'
    WHEN DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) <= 7 THEN 'RECENT'
    WHEN DATE_DIFF(CURRENT_DATE(), first_seen_date, DAY) <= 14 THEN 'ESTABLISHED'
    ELSE 'MATURE'
  END AS trend_freshness,
  ip_name,
  universe,
  characters,
  publisher,
  themes,
  relevance_score
FROM `analytics-324613.trendtool_export.google_trends_enriched`
WHERE 
  trend_category IN ('GAMES', 'MOVIES', 'TV_SERIES', 'MANGA_ANIME')
  AND latest_refresh_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND trend_score >= 50
ORDER BY 
  trend_score DESC,
  growth_7d_pct DESC
LIMIT 50
```

### Usage in Slack Output

```
🕐 Day {{ trend_age_days }} | {{ trend_freshness }}
```

Example: `🕐 Day 3 | NEW 🔥` or `🕐 Day 12 | ESTABLISHED`

---

## 2A.6: Internal Search Data Integration (GA4)

**Purpose:** Pull internal Displate search queries to measure internal demand

### BigQuery Query - GA4 Search Events

```sql
-- Query: Get search terms and volumes from GA4
-- Table: analytics-324613.analytics_374261714.events_*
-- Event: search (or search_perform based on your implementation)

WITH search_events AS (
  SELECT
    -- Extract search term from event parameters
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') AS search_term,
    event_date,
    user_pseudo_id
  FROM `analytics-324613.analytics_374261714.events_*`
  WHERE 
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'search_perform'  -- Confirmed from Displate GA4 docs
    AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') IS NOT NULL
)

SELECT
  LOWER(TRIM(search_term)) AS search_term_normalized,
  COUNT(*) AS search_count_30d,
  COUNT(DISTINCT user_pseudo_id) AS unique_searchers_30d,
  MIN(event_date) AS first_search_date,
  MAX(event_date) AS last_search_date
FROM search_events
WHERE LENGTH(search_term) >= 2  -- Filter out single-char searches
GROUP BY search_term_normalized
HAVING search_count_30d >= 5  -- Minimum threshold
ORDER BY search_count_30d DESC
LIMIT 10000
```

### n8n Node Config - Search Data Lookup

```json
{
  "name": "Fetch Internal Search Data",
  "type": "n8n-nodes-base.googleBigQuery",
  "parameters": {
    "operation": "executeQuery",
    "projectId": "analytics-324613",
    "sqlQuery": "WITH search_events AS (SELECT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') AS search_term, event_date, user_pseudo_id FROM `analytics-324613.analytics_374261714.events_*` WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AND FORMAT_DATE('%Y%m%d', CURRENT_DATE()) AND event_name = 'search_perform'  -- Confirmed from Displate GA4 docs AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') IS NOT NULL) SELECT LOWER(TRIM(search_term)) AS search_term_normalized, COUNT(*) AS search_count_30d, COUNT(DISTINCT user_pseudo_id) AS unique_searchers_30d FROM search_events WHERE LENGTH(search_term) >= 2 GROUP BY search_term_normalized HAVING search_count_30d >= 5 ORDER BY search_count_30d DESC LIMIT 10000"
  }
}
```

### Alternative: Parameterized Query (for matching specific trend)

```sql
-- Use this when you need to check search volume for a specific trend name

DECLARE trend_terms ARRAY<STRING>;
SET trend_terms = ['blue lock', 'bluelock', 'blue-lock', 'isagi'];  -- From enrichment

WITH search_events AS (
  SELECT
    LOWER(TRIM((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term'))) AS search_term,
    user_pseudo_id
  FROM `analytics-324613.analytics_374261714.events_*`
  WHERE 
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'search_perform'  -- Confirmed from Displate GA4 docs
)

SELECT
  COUNT(*) AS total_searches,
  COUNT(DISTINCT user_pseudo_id) AS unique_searchers,
  ARRAY_AGG(DISTINCT search_term LIMIT 10) AS matched_queries
FROM search_events
WHERE 
  -- Match any of the trend terms (fuzzy)
  EXISTS (
    SELECT 1 FROM UNNEST(trend_terms) AS term 
    WHERE search_term LIKE CONCAT('%', term, '%')
  )
```

---

## 2A.7: Search Term Normalization Layer

**Purpose:** Match trend names to search queries with fuzzy logic

### JavaScript Function Node

```javascript
// Node: Normalize and Match Search Terms
// Input: trend data + search data array

const trends = $input.all();  // Array of trends with ip_name, characters, etc.
const searchData = $('Fetch Internal Search Data').all();  // Array of {search_term_normalized, search_count_30d, ...}

// Build search index for fast lookup
const searchIndex = new Map();
searchData.forEach(item => {
  const term = item.json.search_term_normalized.toLowerCase();
  searchIndex.set(term, item.json);
});

// Normalize function
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special chars
    .replace(/\s+/g, ' ')          // Collapse whitespace
    .trim();
}

// Fuzzy match function
function findMatches(searchTerms, searchIndex) {
  const matches = [];
  let totalVolume = 0;
  
  for (const term of searchTerms) {
    const normalized = normalize(term);
    
    // Exact match
    if (searchIndex.has(normalized)) {
      const data = searchIndex.get(normalized);
      matches.push({ term: normalized, volume: data.search_count_30d, type: 'exact' });
      totalVolume += data.search_count_30d;
      continue;
    }
    
    // Partial/contains match
    for (const [indexTerm, data] of searchIndex) {
      if (indexTerm.includes(normalized) || normalized.includes(indexTerm)) {
        if (!matches.find(m => m.term === indexTerm)) {
          matches.push({ term: indexTerm, volume: data.search_count_30d, type: 'partial' });
          totalVolume += data.search_count_30d;
        }
      }
    }
  }
  
  return { matches, totalVolume };
}

// Process each trend
const output = trends.map(trend => {
  const t = trend.json;
  
  // Build search terms from enrichment
  const searchTerms = [
    t.ip_name,
    t.trend_name,
    ...(t.characters || []),
    ...(t.themes || [])
  ].filter(Boolean);
  
  const { matches, totalVolume } = findMatches(searchTerms, searchIndex);
  
  return {
    json: {
      ...t,
      internal_search: {
        search_volume_30d: totalVolume,
        matched_queries: matches.slice(0, 5),
        match_count: matches.length
      }
    }
  };
});

return output;
```

---

## 2B.1: trend_enricher Node (LLM Prompt)

**Purpose:** Extract structured IP metadata from trend names

### System Prompt

```
You are a pop culture and entertainment metadata extractor. Given a trending topic name, extract structured information about it.

You must respond with ONLY valid JSON, no additional text.

Output schema:
{
  "ip_name": "string - The official IP/franchise name",
  "universe": "string | null - The larger universe (e.g., 'Marvel Cinematic Universe', 'Star Wars')",
  "characters": ["array of main character names mentioned or implied"],
  "publisher": "string | null - The company/studio (e.g., 'Nintendo', 'Disney', 'Kodansha')",
  "themes": ["array of 2-4 thematic tags like 'action', 'sci-fi', 'sports anime'"],
  "release_context": "string | null - Why it might be trending (e.g., 'Season 2 release', 'New game DLC')",
  "confidence": "HIGH | MEDIUM | LOW - How confident you are in this extraction"
}

Rules:
- If unsure about a field, use null or empty array
- Character names should be actual character names, not voice actors
- Themes should be merchandising-relevant (what would someone search for)
- Be specific with publisher (not just "Japanese studio" - find the actual name)
```

### User Prompt Template

```
Extract metadata for this trending topic:

Trend Name: {{ trend_name }}
Category: {{ trend_category }}
Google Trends Score: {{ trend_score }}
Growth (7d): {{ growth_7d_pct }}

Respond with JSON only.
```

### n8n Node Config (Vertex AI / Gemini)

```json
{
  "name": "Trend Enricher",
  "type": "n8n-nodes-base.googleVertex",
  "parameters": {
    "model": "gemini-1.5-flash",
    "prompt": "={{ $json.enricher_prompt }}",
    "options": {
      "temperature": 0.1,
      "maxOutputTokens": 500,
      "topP": 0.8
    }
  }
}
```

### Example Input/Output

**Input:**
```
Trend Name: Blue Lock Season 2
Category: MANGA_ANIME
Google Trends Score: 92
Growth (7d): +340%
```

**Output:**
```json
{
  "ip_name": "Blue Lock",
  "universe": null,
  "characters": ["Yoichi Isagi", "Meguru Bachira", "Rensuke Kunigami", "Seishiro Nagi"],
  "publisher": "Kodansha",
  "themes": ["sports anime", "soccer", "competition", "psychological"],
  "release_context": "Season 2 anime premiere",
  "confidence": "HIGH"
}
```

---

## 2B.2: relevance_classifier Node (LLM Prompt)

**Purpose:** Score how relevant a trend is for Displate's catalog

### System Prompt

```
You are a relevance classifier for Displate, a company that sells metal poster artwork. You evaluate whether trending topics are good opportunities for poster merchandise.

Score each trend on a scale of 0-100 for Displate relevance.

High relevance (80-100):
- Visual IPs with strong fan art communities
- Games, anime, movies with iconic characters/scenes
- Sci-fi, fantasy, horror, gaming aesthetics
- Established fandoms that buy merchandise

Medium relevance (50-79):
- General entertainment with some visual appeal
- Sports (teams, athletes)
- Music (artists, bands)
- Some merchandise potential but not core to Displate

Low relevance (0-49):
- News events, politics
- Financial topics
- Non-visual content (podcasts, books without adaptation)
- Trends without clear merchandise angle

Respond with ONLY valid JSON:
{
  "relevance_score": <number 0-100>,
  "relevance_tier": "HIGH | MEDIUM | LOW",
  "reasoning": "One sentence explaining the score",
  "skip_reason": "null | string - If LOW, explain why to skip"
}
```

### User Prompt Template

```
Evaluate Displate relevance for:

Trend: {{ trend_name }}
Category: {{ trend_category }}
IP: {{ ip_name }}
Publisher: {{ publisher }}
Themes: {{ themes | join(', ') }}

Is this a good opportunity for metal poster artwork merchandise?
```

### n8n Node Config

```json
{
  "name": "Relevance Classifier",
  "type": "n8n-nodes-base.googleVertex",
  "parameters": {
    "model": "gemini-1.5-flash",
    "prompt": "={{ $json.classifier_prompt }}",
    "options": {
      "temperature": 0.1,
      "maxOutputTokens": 200
    }
  }
}
```

---

## 2C.5: internal_search_matcher Node

**Purpose:** Match enriched trends to internal search demand

### Function Node Logic

```javascript
// Node: Internal Search Matcher
// Combines trend enrichment with search data

const trend = $input.first().json;

// Search data already attached in 2A.7
const searchData = trend.internal_search || {
  search_volume_30d: 0,
  matched_queries: [],
  match_count: 0
};

// Calculate search rank (percentile among all searches)
const allSearchVolumes = $('Fetch Internal Search Data').all()
  .map(item => item.json.search_count_30d)
  .sort((a, b) => b - a);

const volume = searchData.search_volume_30d;
const rank = allSearchVolumes.findIndex(v => v <= volume) + 1;
const percentile = Math.round((1 - rank / allSearchVolumes.length) * 100);

// Determine demand level
let demandLevel;
if (volume >= 1000) demandLevel = 'HIGH';
else if (volume >= 200) demandLevel = 'MEDIUM';
else if (volume >= 50) demandLevel = 'LOW';
else demandLevel = 'MINIMAL';

return [{
  json: {
    ...trend,
    internal_demand: {
      search_volume_30d: volume,
      search_rank: rank,
      search_percentile: percentile,
      demand_level: demandLevel,
      top_queries: searchData.matched_queries.slice(0, 5).map(m => m.term)
    }
  }
}];
```

---

## 2C.6: demand_supply_gap_calculator Node

**Purpose:** Core intelligence - assess opportunity based on demand vs supply

### Function Node Logic

```javascript
// Node: Demand-Supply Gap Calculator
// THE CORE INTELLIGENCE ENGINE

const trend = $input.first().json;

// Extract signals
const externalSignal = {
  google_trends_score: trend.trend_score || 0,
  growth_7d: trend.growth_7d_pct || '0%',
  trend_age_days: trend.trend_age_days || 0,
  freshness: trend.trend_freshness || 'UNKNOWN'
};

const internalDemand = trend.internal_demand || {
  search_volume_30d: 0,
  demand_level: 'MINIMAL'
};

const supply = {
  marketplace_count: trend.marketplace_count || 0,
  validation_queue: trend.validation_queue_count || 0
};

const coverage = {
  has_brand: trend.has_brand || false
};

// --- GAP ASSESSMENT LOGIC ---

function assessGap(external, internal, supply, coverage) {
  const externalHigh = external.google_trends_score >= 70;
  const externalMed = external.google_trends_score >= 40;
  
  const internalHigh = internal.search_volume_30d >= 500;
  const internalMed = internal.search_volume_30d >= 100;
  
  const supplyLow = supply.marketplace_count < 20;
  const supplyMed = supply.marketplace_count < 100;
  
  const hasBrand = coverage.has_brand;
  
  // Decision matrix
  if (externalHigh && internalHigh && supplyLow && !hasBrand) {
    return {
      assessment: 'HIGH_OPPORTUNITY',
      emoji: '🔥',
      reasoning: 'High external + internal demand, minimal supply, no license coverage',
      action: 'PRIORITIZE_LICENSING'
    };
  }
  
  if (externalHigh && internalHigh && supplyLow && hasBrand) {
    return {
      assessment: 'EXPAND_INVENTORY',
      emoji: '📈',
      reasoning: 'High demand with license in place, need more artworks',
      action: 'PUSH_TO_ARTISTS'
    };
  }
  
  if (externalHigh && !internalHigh) {
    return {
      assessment: 'MONITOR',
      emoji: '👁️',
      reasoning: 'Trending externally but low internal search demand - watch for uptick',
      action: 'WATCH'
    };
  }
  
  if (externalMed && internalMed && !supplyLow) {
    return {
      assessment: 'WELL_COVERED',
      emoji: '✅',
      reasoning: 'Moderate demand with adequate supply',
      action: 'NONE'
    };
  }
  
  if (internalHigh && supplyLow && !hasBrand) {
    return {
      assessment: 'HIGH_OPPORTUNITY',
      emoji: '🔥',
      reasoning: 'Strong internal demand despite lower external signal - fans already searching',
      action: 'PRIORITIZE_LICENSING'
    };
  }
  
  return {
    assessment: 'LOW_PRIORITY',
    emoji: '⏸️',
    reasoning: 'Weak signals across the board',
    action: 'NONE'
  };
}

const gap = assessGap(externalSignal, internalDemand, supply, coverage);

// Construct final output
return [{
  json: {
    trend_name: trend.trend_name,
    trend_category: trend.trend_category,
    ip_name: trend.ip_name,
    
    external_signal: externalSignal,
    internal_demand: internalDemand,
    supply: supply,
    coverage: coverage,
    
    gap_assessment: gap.assessment,
    gap_emoji: gap.emoji,
    gap_reasoning: gap.reasoning,
    recommended_action: gap.action,
    
    // Pass through enrichment for Slack output
    characters: trend.characters,
    themes: trend.themes,
    publisher: trend.publisher,
    relevance_score: trend.relevance_score,
    
    // Metadata
    processed_at: new Date().toISOString()
  }
}];
```

### Gap Assessment Matrix

| External Signal | Internal Demand | Supply | Brand | → Assessment |
|-----------------|-----------------|--------|-------|--------------|
| HIGH (70+) | HIGH (500+) | LOW (<20) | No | 🔥 HIGH_OPPORTUNITY |
| HIGH | HIGH | LOW | Yes | 📈 EXPAND_INVENTORY |
| HIGH | LOW | Any | Any | 👁️ MONITOR |
| MEDIUM | MEDIUM | Adequate | Any | ✅ WELL_COVERED |
| Any | HIGH | LOW | No | 🔥 HIGH_OPPORTUNITY |
| LOW | LOW | Any | Any | ⏸️ LOW_PRIORITY |

---

## 2C.7: Cascade Orchestrator

**Purpose:** Wire all nodes together in correct sequence

### n8n Workflow Structure

```
[Schedule Trigger: Tuesday 11:00 UTC]
         │
         ▼
[Fetch Trends - All Categories] (BigQuery)
         │
         ▼
[Loop Over Items]
         │
    ┌────┴────┐
    ▼         │
[Trend Enricher] (LLM)
    │         │
    ▼         │
[Relevance Classifier] (LLM)
    │         │
    ├─── Skip if LOW ──→ [Skip Log]
    │         │
    ▼         │
[Fetch Internal Search Data] (BigQuery)
    │         │
    ▼         │
[Normalize & Match Search Terms] (Function)
    │         │
    ▼         │
[Brand Catalog Lookup] (BigQuery) - BLOCKED
    │         │
    ▼         │
[Marketplace Search] (API) - BLOCKED  
    │         │
    ▼         │
[Validation Queue Search] (API) - BLOCKED
    │         │
    ▼         │
[Internal Search Matcher] (Function)
    │         │
    ▼         │
[Demand-Supply Gap Calculator] (Function)
    │         │
    └────┬────┘
         │
         ▼
[Aggregate Results]
         │
         ▼
[Format Slack Message] (Block Kit)
         │
         ▼
[Post to Slack]
         │
         ▼
[Save Report to Postgres]
```

---

## Next Steps

### Immediate (Can do now):
1. ✅ Update BigQuery query in n8n (2A.1, 2A.2)
2. ✅ Add trend_enricher LLM node (2B.1)
3. ✅ Add relevance_classifier LLM node (2B.2)
4. ✅ Add internal search query (2A.6)
5. ✅ Add normalization function (2A.7)
6. ✅ Add search matcher function (2C.5)
7. ✅ Add gap calculator function (2C.6)

### Blocked (Need answers):
- 2A.3: Brand catalog table - **Who has the brand list?**
- 2A.4: Marketplace search - **Algolia API access?**
- 2A.5: Validation queue - **Admin API or direct DB?**

### After blockers resolved:
- Wire full cascade in n8n
- Test with real data
- Move to Phase 3 (Slack output)

---

## Testing Checklist

```
[ ] BigQuery query returns data from all 4 categories
[ ] trend_age_days calculating correctly
[ ] Trend enricher returns valid JSON
[ ] Relevance classifier returns scores 0-100
[ ] GA4 search query returns recent data
[ ] Search normalization matches expected terms
[ ] Gap calculator produces expected assessments
[ ] Full pipeline runs without errors
```
