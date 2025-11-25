# Trend Intelligence System

AI-powered platform for identifying pop culture and gaming trends to optimize Displate's content strategy, licensing decisions, and marketplace curation.

**Problem**: We're reactive - licensing and content decisions lag market trends by 4-8 weeks, missing revenue opportunities and leaving catalog gaps. Manual research eats 15-20 hours/week across BizDev, Marketing, and Marketplace teams.

**Solution**: Automated trend detection → AI enrichment → Gap analysis → Actionable delivery via Slack and dashboards.

---

## Current Status (Nov 2025)

| Module | Status | Owner |
|--------|--------|-------|
| Trend Crawler (Google Trends) | 🟡 Working, needs expansion | Bartosz Klocek |
| Trend ETL + Gemini Enrichment | 🟢 Operational | Bartosz Klocek |
| Slack Bot (Weekly Digest) | 🟡 Prototype live | Tomasz Tomczyk |
| Streamlit UI | 🟡 Internal demo up | Bartosz + Maria |
| Gap Analyzer | 🔴 Design phase | Michał Bielacki |
| Asset Aggregator | 🔴 Not started | Waligóra |
| Outreach Agent | 🔴 Not started | Waligóra + Justin |

**🟢 = Done** | **🟡 = Partial/In Progress** | **🔴 = Not Started**

---

## System Architecture

```
Data Collection → Processing & Enrichment → Intelligence → Delivery
     ↓                     ↓                    ↓            ↓
Google Trends        dbt + Gemini AI       Gap Analyzer   Slack Bot
SteamDB (planned)    BigQuery storage      Catalog Match  Streamlit UI
TMDB (planned)                             Search Data    PowerBI
Anime DB (planned)                         HubSpot Deals
```

### Module Breakdown

**1. Trend Crawler** 🟡
- Scrapes Google Trends (Gaming, Pop Culture, US/DE markets)
- Airflow DAG `trend_collection_daily` (2:00 AM CET)
- Storage: GCS → BigQuery `analytics-324613.trendtool_export.google_trends_reporting`
- Needs: More data sources (SteamDB, TMDB, anime DBs)

**2. Trend ETL + AI Enrichment** 🟢
- dbt pipeline structures/dedupes data
- Gemini 1.5 Pro extracts entities, scores severity (1-10), assesses market potential
- Cost: ~$0.02 per 1K trends, 85-90% accuracy
- Output: `analytics-324613.trends.enriched_trends`

**3. Slack Bot** 🟡
- Weekly digest to #tmp_trend_tool_v2 (Monday 9 AM)
- Top 10 trends, rising trends, content gaps
- Testing: https://automation.displate-prod.com/workflow/0K1RlVFhwJ5aNCEW

**4. Gap Analyzer** 🔴
- Cross-reference trends vs. catalog + search data + brand list + HubSpot deals
- Calculate composite gap score (trend severity + search demand + catalog gap + licensing feasibility)
- **Priority integrations needed** (see below)

**5. Streamlit UI** 🟡
- Self-service dashboard (trend explorer, gap analysis, comparison)
- Deployed on Cloud Run, internal demo running
- Needs polish before production

**6. Asset Aggregator** 🔴 (Legal review required)
- Scrape DeviantArt/ArtStation/Reddit for reference artwork
- Match to trending IPs
- High risk: Copyright compliance

**7. Outreach Agent** 🔴
- Identify IP content gaps (e.g., DC missing "Absolute Batman," Capcom weak on RE7-8)
- LinkedIn enrichment for licensor contacts
- Automated outreach workflows

---

## Priority Work (Q1 2026)

**Gap Analyzer - 4 Critical Integrations:**

1. **Internal Search Data** (HIGHEST)
   - Source: BigQuery analytics tables (GA4 events)
   - Logic: TBD - temporal matching or 7/30-day aggregation?
   - Purpose: Validate trend demand with actual user searches

2. **Brand List** (HIGH)
   - Source: Existing BigQuery table
   - Purpose: Map trends to licensed vs. missing brands

3. **HubSpot Deals** (HIGH)
   - Source: HubSpot API (every contract has assigned Brand, BizDev creates deals)
   - Purpose: Show licensing pipeline status in gap analysis

4. **LinkedIn Enrichment** (MEDIUM)
   - Source: LinkedIn scraping
   - Purpose: Enable Outreach Agent automation (licensor contacts)

---

## Data Sources

### Current (✅)
- **Google Trends**: Daily scraping, US/DE, Gaming + Pop Culture categories

### Planned - Priority Order

| Source | Priority | Weeks | Rationale |
|--------|----------|-------|-----------|
| Internal Search | 🔴 CRITICAL | Week 1-2 | Validate trends with user demand |
| Brand List (GBQ) | 🔴 CRITICAL | Week 2-3 | Map licensed vs. missing |
| HubSpot Deals | 🔴 HIGH | Week 3-5 | Show licensing pipeline |
| SteamDB | 🟡 MEDIUM | Week 6-8 | Gaming validation, player counts |
| TMDB/IMDB | 🟡 MEDIUM | Week 8-10 | Movie/TV 6-12mo advance notice |
| Anime DBs | 🟡 HIGH | Week 10-12 | Replace $7-10M lost revenue |
| LinkedIn | 🟡 MEDIUM | Week 12-14 | Outreach automation |
| Reddit | 🟢 LOW | Q2 2026 | Niche community validation |
| Spotify | 🟢 LOW | Q2 2026 | Music/band merch |

**Target: All CRITICAL/HIGH/MEDIUM done by end of Q1 2026. LOW = Q2 2026.**

---

## Tech Stack

**Data Infrastructure**
- BigQuery (analytics-324613) - data warehouse
- Airflow - orchestration
- dbt - transformations
- n8n - Slack bot automation
- GCS - raw file storage
- PubSub - event-driven workflows

**AI/ML**
- Gemini 1.5 Pro (Vertex AI) - enrichment
- Cloud Functions - batch processing
- CLIP (future) - visual similarity

**Apps**
- Streamlit - dashboard UI
- Cloud Run - deployment
- Google OAuth - auth

**Integration**
- Slack Webhooks
- PowerBI connector
- HubSpot API (planned)

---

## Data Flow

```
1. COLLECTION (Airflow: trend_collection_daily, 2:00 AM)
   └─> Scrape APIs → GCS → BigQuery (trends.raw_trends)

2. STRUCTURING (Airflow: trend_structuring_dbt, 2:30 AM)
   └─> dbt models → Dedupe/normalize → trends.structured_trends

3. ENRICHMENT (Airflow: trend_enrichment_gemini, 3:00 AM)
   └─> Fetch unenriched → Cloud Functions + Gemini API
   └─> Update trends.enriched_trends → Publish to PubSub

4. GAP ANALYSIS (Airflow: gap_analysis_daily, 4:00 AM) - NOT YET BUILT
   └─> Cross-ref catalog + search + brands + HubSpot
   └─> Calculate gap_score → trends.gap_analysis

5. DELIVERY
   └─> Slack digest (Monday 9 AM)
   └─> Streamlit UI (on-demand)
   └─> PowerBI refresh (6 AM)
```

---

## Key Metrics

**Gap Score Calculation** (0-10 composite):
```
gap_score = (
    trend_severity × 0.4 +      # AI-assessed market potential
    search_demand × 0.3 +        # Internal user interest
    catalog_gap × 0.2 +          # Content availability deficit
    licensing_feasibility × 0.1  # HubSpot deal status
)
```

**Severity Score** (1-10, Gemini AI):
- 9-10: Major franchise release (Elden Ring DLC, Marvel movie)
- 7-8: Growing niche with strong fanbase
- 5-6: Steady interest, moderate opportunity
- 3-4: Declining trend or oversaturated
- 1-2: Low relevance for Displate

---

## Use Cases

**BizDev (Ozan)**: Slack digest shows Warhammer 40k score 9/10, gap score 9.2, only 23 artworks vs. 200+ demand. Opens Streamlit → sees no HubSpot deal → creates "Games Workshop Licensing" deal. **Decision time: 30 min vs. 3-4 hours manual research.**

**Marketplace (Łukasz)**: Gap dashboard shows Elden Ring gap score 8.5, 87 pending fan art submissions. Batch approves 50 high-quality pieces, schedules featured collection during trend peak. **Revenue: $18K Week 1 vs. $6K baseline.**

**Marketing (Marina)**: Trend comparison shows Dune declining -15% WoW, Last of Us rising +320%. Pivots $15K budget from Dune to Last of Us campaign. **ROAS: 3.8x vs. 1.2x typical.**

---

## Development Roadmap

### Phase 1: Foundation ✅ DONE (Nov 2024 - Jan 2025)
- [x] Google Trends crawler
- [x] dbt ETL pipeline
- [x] Gemini enrichment
- [x] BigQuery storage
- [x] Slack bot prototype

### Phase 2: Self-Service UI 🚧 (Jan - Mar 2025, 12 weeks)
- [ ] Streamlit dashboard (4 pages)
- [ ] Cloud Run deployment
- [ ] UAT with BizDev/Marketplace
- [ ] Production launch

### Phase 3: Gap Analyzer 🚧 (Feb - Apr 2025, 10 weeks, parallel with Phase 2)
- [ ] Internal search integration (Week 1-2)
- [ ] Brand list integration (Week 2-3)
- [ ] HubSpot API (Week 3-5)
- [ ] Gap score algorithm (Week 6-8)
- [ ] PowerBI dashboard + Slack alerts (Week 8-10)

### Phase 4: Multi-Source Expansion 🔮 (End Q1 2026)
- [ ] SteamDB crawler (Week 6-8)
- [ ] TMDB/IMDB crawler (Week 8-10)
- [ ] Anime databases (Week 10-12)
- [ ] LinkedIn enrichment (Week 12-14)

### Phase 5: Content Ecosystem 🔮 (Q2 2026, legal review required)
- [ ] Reference Asset Aggregator (DeviantArt/ArtStation/Reddit)
- [ ] Artist recommendation engine (CLIP embeddings)
- [ ] Catalog Enhancement Engine (retroactive tagging)
- [ ] Content Outreach Agent (automated licensor contact)

---

## Quick Start

**Browse Data (BigQuery)**
```sql
-- Top 10 trends last 7 days
SELECT
  search_term,
  JSON_EXTRACT_SCALAR(enrichment, '$.severity_score') AS severity,
  JSON_EXTRACT_SCALAR(enrichment, '$.market_potential') AS potential
FROM `analytics-324613.trends.enriched_trends`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND geo = 'US'
ORDER BY CAST(severity AS INT64) DESC
LIMIT 10
```

**Slack Digest**
- Channel: #tmp_trend_tool_v2
- Schedule: Monday 9:00 AM CET
- Manual test: https://automation.displate-prod.com/workflow/0K1RlVFhwJ5aNCEW

**Streamlit UI**
- Demo: Internal network only (ask Bartosz for access)
- Production: TBD (Phase 2)

---

## Owners & Contact

| Area | Owner | Slack |
|------|-------|-------|
| Overall System | Mateusz Waligórski | @Waligóra |
| Trend Crawler | Bartosz Klocek | @Bartosz Klocek |
| Trend ETL | Bartosz Klocek | @Bartosz Klocek |
| Slack Bot | Tomasz Tomczyk | @Tomasz Tomczyk |
| Gap Analyzer | Michał Bielacki | @Michał Bielacki |
| Streamlit UI | Bartosz + Maria | @Bartosz Klocek @Maria |
| Outreach Agent | Waligóra + Justin | @Waligóra @Justin |

**Support**: #analytics-data-and-reports

---

## Costs

~$150/month:
- Google Trends: Free
- Gemini API: ~$50/month (2,500 trends × $0.02/1K)
- BigQuery: ~$30/month (storage + queries)
- Cloud Run: ~$20/month (Streamlit)
- Airflow: ~$50/month (GCP Composer)

---

## Expected Impact

**Revenue**: $2-4M additional annual revenue
- 4-6 week lead time on licensing deals
- 15-25% improvement in content conversion
- Systematic gap closure vs. reactive approach

**Efficiency**: 70% reduction in manual research time
- BizDev: 12 hrs/week → 3 hrs/week
- Marketing: 8 hrs/week → 2 hrs/week
- Marketplace: 5 hrs/week → 1 hr/week

**Speed**: 4-6 week competitive advantage in trend identification

---

## BigQuery Schema (Key Tables)

**trends.raw_trends** - Raw scraped data
```sql
search_term STRING
trend_value INT64  -- Google Trends 0-100
category STRING    -- Gaming, Pop Culture
geo STRING         -- US, DE
timestamp TIMESTAMP
```

**trends.enriched_trends** - AI-enriched records
```sql
search_term STRING
trend_value INT64
enrichment JSON    -- {entities, sentiment, severity_score, market_potential}
enriched_at TIMESTAMP
```

**trends.gap_analysis** - Gap scoring (not yet built)
```sql
trend_id STRING
gap_score FLOAT64         -- 0-10 composite
severity_score INT64      -- From enrichment
internal_search_volume INT64
catalog_coverage_pct FLOAT64
hubspot_deal_status STRING
```

---

## FAQ

**Q: Why only Google Trends currently?**  
A: 80% value, 20% effort. Free, reliable, broad coverage. Multi-source expansion coming in Phase 4.

**Q: How accurate is Gemini enrichment?**  
A: 85-90% based on weekly manual validation (20 random trends). Prompt refinement ongoing.

**Q: Can I add custom trends to track?**  
A: Yes, contact Bartosz. Note: Google Trends rate limits = ~200 terms/day max.

**Q: When will internal search data be integrated?**  
A: Phase 3, Week 1-2 (Feb 2025). Highest priority for Gap Analyzer.

**Q: What about anime content (post-removal)?**  
A: Anime database crawler planned for Week 10-12 (Mar 2025) to systematically identify licensed replacement content.

---

**Version**: 2.0 (Nov 25, 2025)  
**Repository**: [Add GitHub URL when created]  
**Documentation**: This README + inline code comments
