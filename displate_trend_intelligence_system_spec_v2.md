# Displate Trend Intelligence System
## Technical Specification & Implementation Guide

**Version:** 2.0  
**Last Updated:** November 25, 2025  
**Document Owner:** Mateusz Waligórski (Head of Analytics)  
**Status:** Living Document - Phase 2 Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Data Sources](#4-data-sources)
5. [AI Enrichment Pipeline](#5-ai-enrichment-pipeline)
6. [Intelligence Outputs](#6-intelligence-outputs)
7. [User Interfaces](#7-user-interfaces)
8. [Technical Stack](#8-technical-stack)
9. [Data Flow](#9-data-flow)
10. [Use Cases](#10-use-cases)
11. [Development Roadmap](#11-development-roadmap)
12. [Security & Governance](#12-security-governance)
13. [Appendices](#13-appendices)

---

## 1. Executive Summary

### 1.1 Business Context

Displate operates a digital marketplace for metal poster artwork, specializing in pop culture, gaming, and entertainment content. The company faces three critical challenges:

1. **Reactive Positioning**: Content acquisition and licensing decisions lag market trends by 4-8 weeks, resulting in missed revenue opportunities during peak demand windows
2. **Content Blind Spots**: Manual research processes fail to identify emerging IPs and niche categories before competitors, leading to catalog gaps in high-potential segments
3. **Resource Inefficiency**: BizDev, Marketing, and Marketplace teams spend 15-20 hours per week on manual trend research, limiting capacity for strategic initiatives

**Recent Impact**: The removal of unlicensed anime content in 2024 resulted in $7-10M revenue loss, highlighting the critical need for predictive content strategy and proactive licensing partnerships.

### 1.2 Solution Vision

The **Trend Intelligence System** is a modular, AI-powered platform that:

- **Automates Detection**: Continuously monitors Google Trends, gaming platforms, social media, and entertainment databases to identify emerging trends 4-6 weeks before mainstream adoption
- **AI Enrichment**: Uses Gemini LLM to extract entities, assess market potential (1-10 severity scoring), analyze sentiment, and provide actionable recommendations
- **Gap Analysis**: Cross-references trending topics against Displate's catalog and internal search data to identify specific content opportunities
- **Actionable Delivery**: Provides weekly Slack digests and self-service dashboards to eliminate analysis paralysis and enable data-driven decision making

### 1.3 Current Implementation Status

As of November 2025, the Trend Intelligence System is **partially operational**:

**✅ COMPLETED (Phase 1 - Foundation)**
- **Trend Intelligence Crawler**: 🟡 **PARTIALLY COMPLETE** - Only Google Trends operational, needs broader data sources and cleaning
  - Owner: Bartosz Klocek
  - Location: `analytics-324613.trendtool_export.google_trends_reporting`
- **Trend Analysis Engine**: 🟢 **DONE** - Gemini AI enrichment working well, prompt could be improved
  - Owner: Bartosz Klocek
  - ETL pipeline operational in dbt
- **Automated Insights Delivery**: 🟡 **PROTOTYPE DONE** - Weekly Slack bot operational but deployment to internal network was challenging
  - Owner: Tomasz Tomczyk
  - Channel: #tmp_trend_tool_v2
  - Test prompt interface: https://automation.displate-prod.com/workflow/0K1RlVFhwJ5aNCEW
  - Alternative testing: https://aistudio.google.com/prompts/new_chat

**🚧 IN PROGRESS (Phase 2-3)**
- **Business Intelligence Dashboard**: 🟡 **MOSTLY DONE** - Internal demo available, network deployment completed
  - Owner: Bartosz Klocek + Maria (to be assigned)
  - Status: Hosted internally, functional but needs polish
- **Content Gap Analyzer**: 🔴 **NOT STARTED** - Design phase only
  - Owner: Michał Bielacki (with Bartosz Klocek support)
  - **IMMEDIATE PRIORITY**: Integration of internal search data and brand list

**🔮 PLANNED (Phase 4-5)**
- **Catalog Enhancement Engine**: 🔴 **NOT STARTED**
- **Reference Asset Aggregator**: 🔴 **NOT STARTED** - Legal review pending
  - Owner: Waligóra
- **Content Outreach Agent**: 🔴 **NOT STARTED** - Workflow mapping required
  - Owner: Waligóra + Justin (support)

### 1.4 Priority Action Items (Q1 2026)

**HIGH PRIORITY** - Content Gap Analyzer enablement:
1. **Internal search data integration** - Connect Displate search queries to trend matching (time-based or aggregated last week/month)
   - Data source: BigQuery analytics tables
   - Matching logic: TBD (temporal correlation vs. recent aggregation)
2. **Brand list integration** - Import existing brand catalog from BigQuery
   - Table: Available in GBQ, needs mapping to trends
3. **HubSpot integration** - Pull brand negotiation status from deals/contracts
   - Method: API extraction from email threads
   - Context: Every contract has assigned Brand, BizDev creates deals in HubSpot
4. **LinkedIn enrichment** - Crawl licensor contact data for outreach automation
   - Purpose: Enable Content Outreach Agent automation

### 1.5 Expected Impact

**Revenue**: $2-4M additional annual revenue through:
- Earlier identification of high-value licensing opportunities (4-6 week lead time)
- Systematic gap closure preventing revenue leakage (15-25% improvement in content conversion)
- Optimized artist acquisition targeting trending niches (20% increase in UGC relevance)

**Efficiency**: 70% reduction in market research time:
- BizDev: 12 hours/week → 3 hours/week (licensing prioritization automation)
- Marketing: 8 hours/week → 2 hours/week (campaign timing optimization)
- Marketplace: 5 hours/week → 1 hour/week (UGC curation focus areas)

**Speed**: 4-6 week competitive advantage:
- Trend detection before mainstream media coverage
- Proactive licensing outreach vs. reactive negotiations
- Pre-positioning marketing campaigns for product launches

### 1.6 Strategic Alignment

The Trend Intelligence System directly supports Displate's 2024-2025 roadmap priorities:

- **Project Behemoth** (Digital Product Roadmap): AI-powered content moderation and marketplace opening to fill demand gaps identified by trend analysis
- **AI in Content Discovery** (Digital Product Roadmap): Enhanced search/recommendation algorithms leveraging trend-enriched metadata
- **Amazon US Expansion** (Business Update May 2024): Data-driven selection of ~30 best-selling SKUs based on predictive trend scoring
- **Post-Anime Strategy** (Business Update May 2024): Systematic identification of replacement content categories to recover $7-10M lost revenue

---

## 2. System Overview

### 2.1 Purpose

The Trend Intelligence System transforms raw market signals into actionable business intelligence for three primary use cases:

1. **Licensing Prioritization** (BizDev): Identify which IP deals to pursue based on predictive demand scoring
2. **Content Gap Closure** (Marketplace/Artist Acquisition): Pinpoint specific themes, characters, and styles missing from Displate's catalog
3. **Campaign Optimization** (Marketing): Time promotional efforts to align with peak trend velocity

### 2.2 Core Value Proposition

**For BizDev**: "Know which IPs to license 6 weeks before your competitors start negotiations"  
**For Marketplace**: "Curate the right fan art at the right time, not 2 months too late"  
**For Marketing**: "Launch campaigns when trends are rising, not declining"  
**For Leadership**: "Replace reactive content strategy with predictive market intelligence"

### 2.3 Key Stakeholders

| Team | Primary Contact | Use Case |
|------|----------------|----------|
| BizDev | Ozan Tuzun (Head of Marketplace) | Licensing deal prioritization, IP roadmap planning |
| Marketplace | Łukasz Konofalski | UGC artist curation, content moderation focus |
| Marketing | Marina Krajnovic | Campaign timing, influencer partnership alignment |
| Content/Artist Acquisition | Natalie Tyler | Recruiting focus, onboarding priority |
| Analytics | Mateusz Waligórski | System ownership, data governance |

---

## 3. System Architecture

### 3.1 High-Level Design

The Trend Intelligence System follows a **modular, event-driven architecture** with seven interconnected components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Trend Crawler          🔮 SteamDB Crawler                   │
│  (Google Trends)           (Gaming Data)                        │
│                                                                 │
│  🔮 IMDB/TMDB Crawler      🔮 Anime DB Crawler                  │
│  (Movie/TV Releases)       (MyAnimeList, AniList)              │
│                                                                 │
│  🔮 Reddit Crawler         🔮 Spotify Crawler                   │
│  (Subreddit Analytics)     (Music/Band Trends)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PROCESSING & ENRICHMENT LAYER                  │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Trend Tool (ETL)                                            │
│  • dbt transformations (data structuring)                       │
│  • Gemini AI enrichment (entity extraction, scoring)            │
│  • BigQuery storage (analytics-324613)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  🚧 Content Gap Analyzer                                        │
│  • Cross-reference trends vs. catalog                           │
│  • Integrate internal search data (PRIORITY #1)                 │
│  • Match against brand list (PRIORITY #2)                       │
│  • HubSpot deal status (PRIORITY #3)                            │
│  • Generate opportunity scores                                  │
│                                                                 │
│  🔮 Catalog Enhancement Engine                                  │
│  • Retroactive metadata tagging                                 │
│  • Trend keyword injection                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DELIVERY LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Trend Slacker            🚧 Streamlit UI                    │
│  (Weekly Slack Bot)         (Self-Service Dashboard)           │
│                                                                 │
│  Direct BigQuery Access     🔮 PowerBI Integration              │
│  (Read-Only for Users)      (Gap Analysis Reports)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AUTOMATION LAYER (FUTURE)                     │
├─────────────────────────────────────────────────────────────────┤
│  🔮 Reference Asset Aggregator                                  │
│  • Scrape DeviantArt, ArtStation, Reddit                        │
│  • Legal review required (copyright compliance)                 │
│                                                                 │
│  🔮 Content Outreach Agent                                      │
│  • Identify IP content gaps (e.g., Absolute Batman, RE2-4)     │
│  • Map licensor contact details (LinkedIn enrichment)           │
│  • Automated outreach workflows                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Status Legend:**
- ✅ **HERE** = Operational in production
- 🚧 **NEXT** = In development (Phases 2-3)
- 🔮 **LATER** = Planned (Phases 4-5)

### 3.2 Module Descriptions

#### Module 1: Trend Intelligence Crawler ✅ HERE (Partial)
**Status**: 🟡 Only Google Trends operational, requires expansion  
**Owner**: Bartosz Klocek

**Purpose**: Continuously scrapes trend data from multiple sources to build a comprehensive view of emerging market signals.

**Current Implementation**:
- **Google Trends**: Daily scraping via `pytrends` library
  - Categories: Gaming (8), Pop Culture
  - Markets: United States, Germany
  - Storage: GCS bucket → BigQuery (`analytics-324613.trendtool_export.google_trends_reporting`)
- **Execution**: Airflow DAG `trend_collection_daily` (2:00 AM CET)

**Planned Expansions**:
- SteamDB (gaming player counts, release dates)
- IMDB/TMDB (movie/TV 6-12 month advance notice)
- Anime databases (MyAnimeList, AniList)
- Reddit (subreddit subscriber growth, post velocity)
- Spotify (emerging artist/band popularity)

**Technical Considerations**:
- Rate limiting: 1 req/sec for Google Trends
- Data cleaning: Remove noise from search term variations
- Deduplication: Normalize entity names (e.g., "Warhammer 40k" vs "WH40K")

#### Module 2: Trend Analysis Engine (ETL) ✅ HERE
**Status**: 🟢 Operational, prompt refinement ongoing  
**Owner**: Bartosz Klocek

**Purpose**: Transform raw trend data into structured, AI-enriched intelligence records.

**Pipeline Stages**:
1. **Data Structuring** (dbt)
   - Normalize timestamps (UTC)
   - Deduplicate search terms
   - Join historical trend data (13-week rolling window)
2. **AI Enrichment** (Gemini 1.5 Pro)
   - Extract named entities (IP, character, franchise, genre)
   - Sentiment analysis (positive/neutral/negative)
   - Severity scoring (1-10, where 10 = highest market potential)
   - Market potential narrative (2-3 sentence explanation)
3. **Storage** (BigQuery)
   - Table: `trends.enriched_trends`
   - Retention: 2 years
   - Access: Read-only for all employees, write for Analytics team

**Current Performance**:
- Processing time: <5 seconds per trend
- Enrichment accuracy: 85-90% (manual validation weekly)
- Cost: ~$0.02 per 1,000 trends (Gemini API)

#### Module 3: Automated Insights Delivery (Trend Slacker) ✅ HERE
**Status**: 🟡 Prototype functional, network deployment challenging  
**Owner**: Tomasz Tomczyk

**Purpose**: Eliminate analysis paralysis by delivering curated trend insights directly to stakeholders via Slack.

**Current Implementation**:
- **Slack Channel**: #tmp_trend_tool_v2
- **Schedule**: Weekly digest (Monday 9:00 AM CET)
- **Content Format**:
  - Top 10 Trends (by severity score)
  - Rising Trends (highest week-over-week velocity)
  - Regional Differences (US vs. Germany)
  - Content Gap Alerts (when high-severity trend has low catalog coverage)

**Testing Interface**:
- n8n workflow: https://automation.displate-prod.com/workflow/0K1RlVFhwJ5aNCEW
- Alternative: Google AI Studio (https://aistudio.google.com/prompts/new_chat)
- Credentials: Tomasz Tomczyk (owner)

**Deployment Challenge**: Internal network access configuration required more effort than expected.

#### Module 4: Content Gap Analyzer 🚧 NEXT
**Status**: 🔴 Not started, design phase  
**Owner**: Michał Bielacki (with Bartosz Klocek support)

**Purpose**: Identify specific revenue opportunities by cross-referencing trends against Displate's catalog, internal search data, and brand pipeline.

**Architecture**:
```
Trends → [Gap Analyzer] ← Displate Catalog
              ↑
              ├── Internal Search Queries (PRIORITY #1)
              ├── Brand List (PRIORITY #2)
              ├── HubSpot Deal Status (PRIORITY #3)
              └── LinkedIn Licensor Data (PRIORITY #4)
```

**Gap Score Calculation** (Composite Metric):
```
gap_score = (
    trend_severity * 0.4 +           # Market potential
    search_demand * 0.3 +             # Internal user interest
    catalog_gap * 0.2 +               # Availability deficit
    licensing_feasibility * 0.1       # HubSpot negotiation status
)
```

**Priority Data Integrations**:

1. **Internal Search Data** (PRIORITY #1)
   - Source: BigQuery analytics tables (GA4 event stream)
   - Logic: TBD - Either:
     - **Temporal matching**: Correlate search spikes with trend emergence
     - **Recent aggregation**: Last 7/30 days search volume
   - Use case: Validate that trending topics align with actual user demand

2. **Brand List** (PRIORITY #2)
   - Source: Existing BigQuery table (licensed brands)
   - Mapping: Match trend entities to existing/missing brands
   - Use case: Identify which brands need expansion vs. net new licensing

3. **HubSpot Integration** (PRIORITY #3)
   - Source: HubSpot API (deals/contracts)
   - Extraction: Email thread analysis, deal stage
   - Context: Every contract has assigned Brand, BizDev creates deals
   - Use case: Prioritize trends where licensing is already in progress

4. **LinkedIn Enrichment** (PRIORITY #4)
   - Source: LinkedIn profile/company data (web scraping)
   - Target: Licensor contact information (legal, partnerships teams)
   - Use case: Enable Content Outreach Agent automation

**Output**:
- Gap analysis table in BigQuery
- PowerBI dashboard with sortable gap scores
- Slack alerts for high-priority gaps (score >8.0)

#### Module 5: Business Intelligence Dashboard (Streamlit UI) 🚧 NEXT
**Status**: 🟡 Internal demo hosted, needs polish  
**Owner**: Bartosz Klocek + Maria (to be assigned)

**Purpose**: Provide self-service analytics for non-technical teams to explore trend data, forecast demand, and identify opportunities.

**Demo**: Currently accessible internally (network deployment complete)

**Planned Features**:
1. **Dashboard Tab**
   - Trend heatmap (geography × category)
   - Top 10 trends widget
   - Quick search bar
2. **Trend Explorer Tab**
   - Time-series charts (13-week rolling)
   - Category filters (Gaming, Pop Culture, Anime, etc.)
   - Export to CSV
3. **Gap Analysis Tab**
   - Sortable table (gap score, trend severity, search demand)
   - Drill-down to artwork examples
4. **Trend Comparison Tab**
   - Side-by-side comparison (up to 5 trends)
   - Correlation analysis

**Technical Stack**:
- Framework: Streamlit
- Deployment: Google Cloud Run (containerized)
- Authentication: Google OAuth (Displate domain only)
- Data source: BigQuery direct connection

**Development Timeline**: ~4-6 weeks (Q1 2026)

#### Module 6: Catalog Enhancement Engine 🔮 LATER
**Status**: 🔴 Not started  

**Purpose**: Retroactively enrich existing artwork metadata with trend-relevant keywords to improve discoverability.

**Logic**:
1. Identify artworks visually similar to trending entities (CLIP embeddings)
2. Generate trend-relevant tags (e.g., "Elden Ring inspired," "Dark Souls aesthetic")
3. Update artwork metadata without artist intervention

**Risks**:
- Tag accuracy (false positives may frustrate artists)
- Artist pushback on automated changes
- SEO impact (Google penalty for keyword stuffing)

**Mitigation**: Pilot with 1,000 artworks, A/B test search performance

#### Module 7: Reference Asset Aggregator 🔮 LATER
**Status**: 🔴 Not started, legal review pending  
**Owner**: Waligóra

**Purpose**: Automatically collect inspiration materials and reference artwork from diverse sources, directly tied to identified trends.

**Data Sources**:
- DeviantArt (fan art collections)
- ArtStation (professional portfolios)
- Reddit (r/ImaginaryWarhammer, r/Cyberpunk, etc.)

**Legal Considerations**:
- **HIGH RISK**: Copyright compliance for scraped artwork
- **REQUIRED**: Legal team review before implementation
- **SAFE ALTERNATIVE**: Reference external URLs without downloading images

#### Module 8: Content Outreach Agent 🔮 LATER
**Status**: 🔴 Not started, workflow mapping required  
**Owner**: Waligóra + Justin (support)

**Purpose**: Automate the identification of IP content gaps and licensor outreach process.

**Use Cases**:
1. **IP Gap Detection** (compare licensed content vs. what's selling)
   - Example: DC Comics - we have Batman, but missing "Absolute Batman," "DC vs Vampires," "Batman Metal" story arcs
   - Example: Marvel - missing "Old Man Logan," "Ultimate," "Marvel Zombies," "Ruins" series
   - Example: Capcom - strong RE2-RE4 presence, weak RE7-RE8
   
2. **Automated Licensor Research**
   - Map contact details (LinkedIn enrichment - PRIORITY #4)
   - Identify recent partnership deals (company blog, LinkedIn posts)
   - Diagram phases of IP research & acquisition process

3. **Outreach Automation**
   - Email templates based on deal type (brand expansion vs. net new)
   - CRM integration (HubSpot deal creation)

**Prerequisites**:
- Content Gap Analyzer operational (provides gap data)
- LinkedIn enrichment pipeline (PRIORITY #4)
- BizDev workflow mapping session (define automation boundaries)

---

## 4. Data Sources

### 4.1 Current Data Sources (✅ Operational)

#### Google Trends
- **API**: `pytrends` (unofficial Google Trends API)
- **Coverage**: United States, Germany
- **Categories**: Gaming (Category ID: 8), Pop Culture
- **Frequency**: Daily scraping (2:00 AM CET)
- **Lookback Window**: 13 weeks (rolling)
- **Data Points**: Search term, trend value (0-100), timestamp
- **Rate Limiting**: 1 request per second
- **Storage**: GCS bucket `analytics-324613/trends/raw/` → BigQuery `trendtool_export.google_trends_reporting`

**Example Queries**:
```python
# Sample pytrends usage
pytrends.build_payload(
    kw_list=['Warhammer 40k', 'Elden Ring'],
    cat=8,  # Gaming category
    timeframe='now 7-d',
    geo='US'
)
trends_df = pytrends.interest_over_time()
```

### 4.2 Planned Data Sources (🔮 Roadmap)

#### SteamDB
**Purpose**: Gaming trend validation, release date intelligence  
**Implementation**: Q2 2026 (Phase 4)  
**Data Points**:
- Daily player counts (identify rising games)
- Release dates (6-12 month advance notice)
- Top sellers list (validate Google Trends gaming data)
- DLC/expansion announcements

**Technical Approach**:
- Web scraping (no official API)
- Focus: Top 100 games by player count
- Frequency: Daily
- Use case: Cross-validate gaming trends from Google Trends

#### IMDB/TMDB
**Purpose**: Movie/TV release pipeline (6-12 month lead time)  
**Implementation**: Q2 2026 (Phase 4)  
**Data Points**:
- Upcoming releases (production status)
- Cast announcements
- Trailer release dates
- Box office projections (The Numbers API)

**Technical Approach**:
- TMDB API (official, 40 requests/10 seconds)
- Focus: Blockbuster franchises (Marvel, DC, Star Wars, etc.)
- Frequency: Weekly
- Use case: Proactive licensing outreach before mainstream hype

#### Anime Databases (MyAnimeList, AniList)
**Purpose**: Anime trend detection (critical post-removal strategy)  
**Implementation**: Q3 2026 (Phase 4)  
**Data Points**:
- Airing schedule (seasonal releases)
- User ratings/favorites
- Discussion forum activity
- Manga adaptation announcements

**Technical Approach**:
- MyAnimeList API (official)
- AniList GraphQL API
- Focus: Top 50 airing anime + upcoming adaptations
- Frequency: Weekly
- Use case: Replace $7-10M lost anime revenue with licensed content

#### Reddit
**Purpose**: Niche community trend validation  
**Implementation**: Q3-Q4 2026 (Phase 4)  
**Data Points**:
- Subreddit subscriber growth
- Post velocity (submissions per day)
- Upvote/comment engagement
- Crosspost patterns

**Technical Approach**:
- Reddit API (official, OAuth required)
- Focus: r/gaming, r/movies, r/television, r/anime, franchise-specific subs
- Frequency: Daily
- Use case: Early detection of grassroots trends before mainstream

#### Spotify
**Purpose**: Music/band artwork opportunities  
**Implementation**: Q4 2026 (Phase 4)  
**Data Points**:
- Artist monthly listeners (identify rising musicians)
- Playlist inclusions (e.g., "RapCaviar," "Rock This")
- Tour announcements

**Technical Approach**:
- Spotify Web API (official)
- Focus: Artists with 100K-10M monthly listeners (growing mid-tier)
- Frequency: Weekly
- Use case: Identify band merchandise opportunities (e.g., metalcore, synthwave)

### 4.3 Data Source Prioritization

| Source | Priority | Implementation | Rationale |
|--------|----------|---------------|-----------|
| Google Trends | ✅ COMPLETE | Nov 2024 | Foundational, broad coverage |
| Internal Search | 🚧 HIGH | Q1 2026 | Validate trends with actual user demand |
| Brand List (GBQ) | 🚧 HIGH | Q1 2026 | Identify expansion vs. net new licensing |
| HubSpot Deals | 🚧 HIGH | Q1 2026 | Prioritize in-progress negotiations |
| SteamDB | 🔮 MEDIUM | Q2 2026 | Gaming-specific validation |
| TMDB | 🔮 MEDIUM | Q2 2026 | Proactive movie/TV licensing |
| Anime Databases | 🔮 HIGH | Q3 2026 | Replace lost revenue stream |
| LinkedIn | 🔮 MEDIUM | Q3 2026 | Enable outreach automation |
| Reddit | 🔮 LOW | Q3-Q4 2026 | Niche community validation |
| Spotify | 🔮 LOW | Q4 2026 | Music merchandise expansion |

---

## 5. AI Enrichment Pipeline

### 5.1 Gemini 1.5 Pro Integration

**Model**: Gemini 1.5 Pro (Google Cloud Vertex AI)  
**Context Window**: 1 million tokens (supports long-form trend analysis)  
**Multimodal**: Text + image (future: analyze trending artwork styles)  
**Cost**: ~$0.02 per 1,000 trends (batch processing)

### 5.2 Enrichment Process

**Input**: Raw trend record from Google Trends
```json
{
  "search_term": "Warhammer 40k",
  "trend_value": 87,
  "category": "Gaming",
  "geo": "US",
  "timestamp": "2025-01-15T00:00:00Z"
}
```

**Gemini Prompt** (System Instructions):
```
You are a pop culture and gaming trend analyst for Displate, a marketplace selling metal poster artwork.

Analyze the following trend data and provide:
1. **Named Entities**: Extract IP name, franchise, characters, genre (JSON array)
2. **Sentiment**: Classify as Positive/Neutral/Negative (based on news sentiment)
3. **Severity Score**: Rate market potential 1-10 (10 = highest revenue opportunity)
4. **Market Potential**: 2-3 sentence explanation of why this trend matters for Displate

**Severity Scoring Guidelines**:
- 9-10: Major franchise release (e.g., Elden Ring DLC, Marvel movie)
- 7-8: Growing niche with strong fanbase (e.g., indie game viral moment)
- 5-6: Steady interest, moderate opportunity (e.g., evergreen franchises)
- 3-4: Declining trend or oversaturated (e.g., post-hype falloff)
- 1-2: Low relevance for Displate audience

Input: {trend_data}
```

**Output**: Enriched trend record
```json
{
  "search_term": "Warhammer 40k",
  "trend_value": 87,
  "category": "Gaming",
  "geo": "US",
  "timestamp": "2025-01-15T00:00:00Z",
  "enrichment": {
    "entities": [
      {"type": "IP", "name": "Warhammer 40,000"},
      {"type": "Franchise", "name": "Warhammer"},
      {"type": "Genre", "name": "Grimdark Sci-Fi"}
    ],
    "sentiment": "Positive",
    "severity_score": 9,
    "market_potential": "Warhammer 40k is experiencing a resurgence driven by the Space Marine 2 game launch and upcoming Amazon TV series. Strong, dedicated fanbase with high merchandise spending. Excellent opportunity for licensed artwork partnerships with Games Workshop.",
    "enriched_at": "2025-01-15T02:15:00Z"
  }
}
```

### 5.3 Batch Processing Architecture

**Trigger**: Airflow DAG `trend_enrichment_gemini` (daily, 3:00 AM CET)

**Flow**:
1. **Fetch Unenriched Trends** (BigQuery)
   ```sql
   SELECT * FROM trends.raw_trends
   WHERE enriched_at IS NULL
   LIMIT 100
   ```
2. **Batch Processing** (Cloud Functions)
   - Chunk size: 10 trends per batch
   - Parallel execution: 5 concurrent Cloud Functions
   - Timeout: 60 seconds per batch
3. **Gemini API Call** (Google Cloud Vertex AI)
   - Retry logic: 3 attempts with exponential backoff
   - Error handling: Log failed trends to `trends.enrichment_errors`
4. **Store Results** (BigQuery)
   ```sql
   UPDATE trends.raw_trends
   SET enrichment = {gemini_response},
       enriched_at = CURRENT_TIMESTAMP()
   WHERE id = {trend_id}
   ```
5. **PubSub Notification** (trigger downstream workflows)
   - Topic: `trend-enriched`
   - Subscribers: Gap Analyzer, Slack Bot

### 5.4 Quality Control

**Validation**:
- **Automated**: dbt tests for null values, severity score range (1-10)
- **Manual**: Weekly review of 20 random enriched trends by Bartosz Klocek

**Metrics**:
- Enrichment accuracy: 85-90% (based on manual validation)
- Processing latency: <5 seconds per trend
- Error rate: <2% (mostly API timeouts)

**Continuous Improvement**:
- Monthly prompt refinement based on stakeholder feedback
- A/B testing of prompt variations
- Fine-tuning Gemini model (future, if needed)

---

## 6. Intelligence Outputs

### 6.1 Enriched Trend Data (BigQuery)

**Table**: `analytics-324613.trends.enriched_trends`

**Schema**:
```sql
CREATE TABLE trends.enriched_trends (
  id STRING,
  search_term STRING,
  trend_value INT64,
  category STRING,
  geo STRING,
  timestamp TIMESTAMP,
  enrichment JSON,  -- Gemini AI output
  gap_score FLOAT64,  -- From Content Gap Analyzer
  created_at TIMESTAMP,
  enriched_at TIMESTAMP
)
PARTITION BY DATE(timestamp)
CLUSTER BY category, geo
```

**Access**:
- Read-only for all Displate employees
- Write access: Analytics team only
- Query tool: BigQuery console, dbt models, PowerBI connector

### 6.2 Weekly Slack Digest

**Channel**: #tmp_trend_tool_v2  
**Schedule**: Monday 9:00 AM CET  
**Owner**: Tomasz Tomczyk

**Content Sections**:

1. **Top 10 Trends** (by severity score)
   ```
   🔥 This Week's Top Trends (US Market)
   
   1. Warhammer 40k (Score: 9/10) - Space Marine 2 launch driving 450% search growth
   2. Elden Ring (Score: 8/10) - DLC announcement speculation peaking
   3. Dune Part 3 (Score: 7/10) - Steady interest, licensing opportunity
   ...
   ```

2. **Rising Trends** (highest week-over-week velocity)
   ```
   📈 Fastest Rising Trends
   
   • The Last of Us Season 2 (+320% WoW) - HBO series renewal
   • Baldur's Gate 3 (+180% WoW) - Game Awards nomination
   ```

3. **Regional Differences** (US vs. Germany)
   ```
   🌍 Geographic Insights
   
   🇺🇸 US: Strong Marvel movie interest (Deadpool & Wolverine)
   🇩🇪 Germany: Soccer trends dominating (Bundesliga art opportunities)
   ```

4. **Content Gap Alerts** (high-severity trends with low catalog coverage)
   ```
   ⚠️ Content Gaps to Address
   
   • Warhammer 40k: Only 23 artworks vs. estimated demand for 200+
   • Baldur's Gate 3: 5 artworks, zero licensed content
   
   💡 Recommendation: Prioritize Warhammer licensing, open UGC for BG3 fan art
   ```

**Testing/Preview**:
- n8n workflow: https://automation.displate-prod.com/workflow/0K1RlVFhwJ5aNCEW
- Alternative: Google AI Studio (manual prompt testing)

### 6.3 Gap Analysis Reports (PowerBI)

**Dashboard**: "Trend Intelligence - Content Gaps"  
**Refresh**: Daily (6:00 AM CET)  
**Owner**: Bartosz Klocek + Maria (to be assigned)

**Visualizations**:

1. **Gap Score Leaderboard**
   - Sortable table: Trend name, Gap score, Severity, Search demand, Catalog coverage
   - Drill-down: Click trend → View existing artworks

2. **Trend Heatmap**
   - X-axis: Time (13-week rolling)
   - Y-axis: Trend name
   - Color: Gap score (red = high opportunity, green = well-covered)

3. **Category Breakdown**
   - Pie chart: Gap opportunities by category (Gaming, Movies, Anime, etc.)
   - Filter: Geography, severity threshold

4. **Licensing Pipeline**
   - Integration with HubSpot data (PRIORITY #3)
   - Show trends where licensing deals are in progress
   - Alert: High-gap trends with no active HubSpot deal

### 6.4 Artist Recommendations (🔮 Future)

**Purpose**: Match trending IPs with artist portfolios for recruiting/commissioning

**Logic**:
1. Identify trending IP (e.g., "Warhammer 40k")
2. Query artist catalog for stylistically similar artworks (CLIP embeddings)
3. Rank artists by:
   - Style match (cosine similarity >0.85)
   - Sales performance (historical revenue)
   - Upload frequency (active vs. dormant)
4. Output: Top 10 artists to recruit for Warhammer content

**Delivery**: Email digest to Artist Acquisition team (weekly)

---

## 7. User Interfaces

### 7.1 Slack Bot (Trend Slacker) ✅ HERE

**Current State**: 🟡 Prototype functional, weekly digests operational

**Features**:
- **Weekly Digest**: Top 10 trends, rising trends, content gaps (Monday 9:00 AM CET)
- **Channel**: #tmp_trend_tool_v2
- **Testing**: n8n workflow + Google AI Studio

**Future Enhancements** (Phase 3):
- On-demand queries: `/trends search Warhammer`
- Personalized alerts: Notify BizDev when high-severity trend matches their focus area
- Interactive buttons: "Add to licensing roadmap," "Flag for artist recruitment"

### 7.2 Streamlit Dashboard 🚧 NEXT

**Status**: 🟡 Internal demo hosted, needs polish  
**Timeline**: 4-6 weeks (Q1 2026)  
**Owner**: Bartosz Klocek + Maria (to be assigned)

**Architecture**:
```
User Browser → Google Cloud Run (Streamlit) → BigQuery (read-only)
                          ↓
                 Google OAuth (displate.com domain)
```

**Pages**:

1. **Dashboard** (Default Landing Page)
   - **Trend Heatmap**: Geography (x-axis) × Category (y-axis), color-coded by severity
   - **Top 10 Widget**: Current week's highest-scoring trends
   - **Quick Search**: Search bar with autocomplete (trend name, IP, genre)
   - **Date Range Selector**: Last 7/30/90 days

2. **Trend Explorer**
   - **Time-Series Chart**: Selected trend(s) over 13-week rolling window
   - **Filters**: Category, Geography, Severity threshold (slider 1-10)
   - **Comparison Mode**: Overlay up to 5 trends
   - **Export**: CSV download (filtered results)

3. **Gap Analysis**
   - **Sortable Table**: Trend name, Gap score, Severity, Search demand, Catalog coverage, HubSpot status
   - **Drill-Down**: Click trend → Modal showing:
     - Existing Displate artworks (thumbnails + sales data)
     - Sample reference artwork (if Reference Asset Aggregator operational)
     - Recommended action (licensing, UGC curation, etc.)
   - **Filters**: Gap score threshold, Category, Licensing status

4. **Trend Comparison**
   - **Side-by-Side View**: Compare up to 5 trends
   - **Metrics Table**: Severity, Search volume, Gap score, Trend velocity
   - **Correlation Analysis**: Identify co-trending IPs (e.g., "Elden Ring" + "Dark Souls")

**Technical Stack**:
- **Framework**: Streamlit (Python)
- **Deployment**: Google Cloud Run (containerized app)
- **Authentication**: Google OAuth (restrict to @displate.com emails)
- **Data Source**: BigQuery direct connection (read-only service account)
- **Hosting**: Cloud Run URL (internal Displate network only)

**User Roles**:
- **All Employees**: Read-only access to all pages
- **Analytics Team**: Additional access to data quality metrics, error logs

### 7.3 BigQuery Direct Access

**Use Case**: Advanced users (Analytics, Data Engineering) who need custom queries

**Access**:
- **Tool**: BigQuery console (console.cloud.google.com)
- **Project**: analytics-324613
- **Dataset**: `trends`
- **Tables**: `raw_trends`, `enriched_trends`, `gap_analysis`

**Example Query** (Top 10 trends last 7 days):
```sql
SELECT
  search_term,
  AVG(trend_value) AS avg_trend,
  MAX(JSON_EXTRACT_SCALAR(enrichment, '$.severity_score')) AS severity,
  MAX(JSON_EXTRACT_SCALAR(enrichment, '$.market_potential')) AS potential
FROM `analytics-324613.trends.enriched_trends`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND geo = 'US'
GROUP BY search_term
ORDER BY severity DESC
LIMIT 10
```

---

## 8. Technical Stack

### 8.1 Data Infrastructure

| Component | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| Data Warehouse | BigQuery (analytics-324613) | Central storage for all trend data | ✅ HERE |
| Orchestration | Apache Airflow | DAG scheduling (collection, ETL, enrichment) | ✅ HERE |
| Transformation | dbt (data build tool) | Data structuring, deduplication, normalization | ✅ HERE |
| Workflow Automation | n8n (automation.displate-prod.com) | Slack bot trigger logic | ✅ HERE |
| Message Queue | Google PubSub | Event-driven architecture (trend-enriched topic) | ✅ HERE |
| Object Storage | Google Cloud Storage | Raw data files (pre-BigQuery ingestion) | ✅ HERE |

### 8.2 AI/ML Stack

| Component | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| LLM | Gemini 1.5 Pro (Vertex AI) | Trend enrichment (entity extraction, scoring) | ✅ HERE |
| Batch Processing | Cloud Functions (Python 3.11) | Parallel Gemini API calls | ✅ HERE |
| Embeddings | CLIP (HuggingFace) | Visual similarity (future: artwork matching) | 🔮 LATER |
| Image Analysis | Gemini Vision | Reference artwork style classification | 🔮 LATER |

### 8.3 Application Stack

| Component | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| Frontend | Streamlit (Python) | Self-service dashboard UI | 🚧 NEXT |
| Deployment | Google Cloud Run | Containerized Streamlit app hosting | 🚧 NEXT |
| Authentication | Google OAuth | Restrict access to @displate.com domain | 🚧 NEXT |
| Version Control | GitLab | Code repository (dbt models, Airflow DAGs) | ✅ HERE |

### 8.4 Integration Stack

| Component | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| Slack | Webhooks | Weekly digest delivery (#tmp_trend_tool_v2) | ✅ HERE |
| PowerBI | BigQuery connector | Gap analysis dashboard | 🚧 NEXT |
| HubSpot | REST API | Brand deal status (licensing pipeline) | 🔮 LATER |
| LinkedIn | Web scraping | Licensor contact enrichment | 🔮 LATER |

---

## 9. Data Flow

### 9.1 End-to-End Pipeline

```
┌─────────────────┐
│  Data Sources   │ (Google Trends, SteamDB, TMDB, etc.)
└────────┬────────┘
         ↓
┌─────────────────┐
│ 1. COLLECTION   │ Airflow DAG: trend_collection_daily
│                 │ • Scrape API/web sources
│                 │ • Store raw CSV in GCS bucket
│                 │ • Load to BigQuery (trends.raw_trends)
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. STRUCTURING  │ Airflow DAG: trend_structuring_dbt
│                 │ • dbt transformations (dedupe, normalize)
│                 │ • Join historical data (13-week window)
│                 │ • Output: trends.structured_trends
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. ENRICHMENT   │ Airflow DAG: trend_enrichment_gemini
│                 │ • Fetch unenriched trends (WHERE enriched_at IS NULL)
│                 │ • Batch process via Cloud Functions + Gemini API
│                 │ • Update trends.enriched_trends (JSON enrichment field)
│                 │ • Publish to PubSub topic: trend-enriched
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. GAP ANALYSIS │ Airflow DAG: gap_analysis_daily
│                 │ • Cross-reference trends vs. catalog (item_id join)
│                 │ • Integrate internal search data (PRIORITY #1)
│                 │ • Match brand list (PRIORITY #2)
│                 │ • Pull HubSpot deal status (PRIORITY #3)
│                 │ • Calculate gap_score (composite metric)
│                 │ • Output: trends.gap_analysis
└────────┬────────┘
         ↓
┌─────────────────┐
│  5. DELIVERY    │ 
│                 │ Weekly: Slack digest (Monday 9 AM CET)
│                 │ Daily: PowerBI dashboard refresh (6 AM CET)
│                 │ On-Demand: Streamlit UI queries (Cloud Run)
└─────────────────┘
```

### 9.2 Airflow DAG Details

#### DAG 1: `trend_collection_daily` ✅ HERE
**Schedule**: Daily at 2:00 AM CET  
**Owner**: Bartosz Klocek

**Tasks**:
1. `scrape_google_trends_us` (Python Operator)
   ```python
   from pytrends.request import TrendReq
   
   pytrends = TrendReq(hl='en-US', tz=360)
   pytrends.build_payload(
       kw_list=["Warhammer 40k", "Elden Ring", ...],
       cat=8,  # Gaming
       timeframe='now 7-d',
       geo='US'
   )
   df = pytrends.interest_over_time()
   df.to_csv('gs://analytics-324613/trends/raw/us_{date}.csv')
   ```

2. `scrape_google_trends_de` (Python Operator)
   - Same as above, geo='DE'

3. `load_to_bigquery` (BigQueryOperator)
   ```sql
   LOAD DATA OVERWRITE trends.raw_trends
   FROM FILES (
     format = 'CSV',
     uris = ['gs://analytics-324613/trends/raw/us_*.csv']
   );
   ```

**Error Handling**:
- Retry logic: 3 attempts with 5-minute intervals
- Slack alert: Notify #analytics-data-and-reports on failure

#### DAG 2: `trend_structuring_dbt` ✅ HERE
**Schedule**: Daily at 2:30 AM CET  
**Trigger**: After `trend_collection_daily` success  
**Owner**: Bartosz Klocek

**Tasks**:
1. `dbt_run_staging` (BashOperator)
   ```bash
   dbt run --models staging.stg_trends --target prod
   ```
   - Deduplicate search terms (case-insensitive)
   - Normalize timestamps (UTC)
   - Remove null values

2. `dbt_run_intermediate` (BashOperator)
   ```bash
   dbt run --models intermediate.int_trends_historical --target prod
   ```
   - Join with 13-week rolling window
   - Calculate trend velocity (week-over-week % change)

3. `dbt_test` (BashOperator)
   ```bash
   dbt test --models staging intermediate --target prod
   ```
   - Ensure no duplicate (search_term, timestamp, geo) combinations
   - Check trend_value range (0-100)

**Output**: `trends.structured_trends` table

#### DAG 3: `trend_enrichment_gemini` ✅ HERE
**Schedule**: Daily at 3:00 AM CET  
**Trigger**: After `trend_structuring_dbt` success  
**Owner**: Bartosz Klocek

**Tasks**:
1. `fetch_unenriched_trends` (BigQueryOperator)
   ```sql
   CREATE OR REPLACE TEMP TABLE unenriched AS
   SELECT * FROM trends.structured_trends
   WHERE enriched_at IS NULL
   LIMIT 100;
   ```

2. `enrich_batch_1` through `enrich_batch_10` (CloudFunctionOperator)
   - Parallel execution: 10 Cloud Functions (10 trends each)
   - Function logic:
     ```python
     import vertexai
     from vertexai.preview.generative_models import GenerativeModel
     
     model = GenerativeModel("gemini-1.5-pro")
     response = model.generate_content(prompt)
     enrichment = json.loads(response.text)
     
     # Store in BigQuery
     bq_client.query(f"""
       UPDATE trends.structured_trends
       SET enrichment = '{json.dumps(enrichment)}',
           enriched_at = CURRENT_TIMESTAMP()
       WHERE id = '{trend_id}'
     """)
     ```

3. `publish_to_pubsub` (PubSubOperator)
   ```python
   pubsub_client.publish(
       topic='trend-enriched',
       data=json.dumps({'trend_id': trend_id})
   )
   ```

**Error Handling**:
- Failed trends logged to `trends.enrichment_errors`
- Manual review required for error rate >5%

#### DAG 4: `gap_analysis_daily` 🚧 NEXT
**Schedule**: Daily at 4:00 AM CET  
**Trigger**: After `trend_enrichment_gemini` success  
**Owner**: Michał Bielacki

**Tasks** (Planned):
1. `fetch_enriched_trends` (BigQueryOperator)
   ```sql
   SELECT * FROM trends.enriched_trends
   WHERE timestamp >= CURRENT_DATE() - 7
     AND JSON_EXTRACT_SCALAR(enrichment, '$.severity_score') >= 7
   ```

2. `match_catalog` (Python Operator)
   - Cross-reference trend entities vs. Displate catalog
   - Logic: Fuzzy string matching + manual entity mapping

3. `integrate_search_data` (BigQueryOperator) - **PRIORITY #1**
   ```sql
   -- TBD: Temporal matching or recent aggregation?
   SELECT
     trend.search_term,
     SUM(search.query_count) AS internal_demand
   FROM trends.enriched_trends AS trend
   LEFT JOIN analytics.search_queries AS search
     ON LOWER(trend.search_term) = LOWER(search.query_text)
   WHERE search.timestamp >= CURRENT_DATE() - 30
   GROUP BY trend.search_term
   ```

4. `match_brand_list` (BigQueryOperator) - **PRIORITY #2**
   ```sql
   SELECT
     trend.search_term,
     brand.brand_name,
     brand.licensing_status
   FROM trends.enriched_trends AS trend
   LEFT JOIN catalog.brands AS brand
     ON trend.enrichment.entities LIKE CONCAT('%', brand.brand_name, '%')
   ```

5. `pull_hubspot_deals` (PythonOperator) - **PRIORITY #3**
   ```python
   # Fetch HubSpot deals via API
   deals = hubspot_client.crm.deals.get_all()
   for deal in deals:
       brand_name = deal['properties']['brand']
       deal_stage = deal['properties']['dealstage']
       # Store in BigQuery: trends.hubspot_deals
   ```

6. `calculate_gap_score` (BigQueryOperator)
   ```sql
   CREATE OR REPLACE TABLE trends.gap_analysis AS
   SELECT
     trend.search_term,
     trend.enrichment.severity_score * 0.4 +
     search.internal_demand * 0.3 +
     (100 - catalog.coverage_pct) * 0.2 +
     hubspot.feasibility_score * 0.1 AS gap_score
   FROM trends.enriched_trends AS trend
   LEFT JOIN ... (joins for search, catalog, hubspot)
   ```

**Output**: `trends.gap_analysis` table

#### DAG 5: `trend_slack_digest_weekly` ✅ HERE
**Schedule**: Weekly (Monday 9:00 AM CET)  
**Owner**: Tomasz Tomczyk

**Tasks**:
1. `generate_top_10` (BigQueryOperator)
   ```sql
   SELECT search_term, enrichment.severity_score
   FROM trends.enriched_trends
   WHERE timestamp >= CURRENT_DATE() - 7
   ORDER BY enrichment.severity_score DESC
   LIMIT 10
   ```

2. `generate_rising_trends` (BigQueryOperator)
   ```sql
   -- Calculate week-over-week velocity
   SELECT search_term, 
          (trend_value_current / trend_value_previous - 1) * 100 AS wow_change
   FROM trends.enriched_trends
   ORDER BY wow_change DESC
   LIMIT 5
   ```

3. `generate_content_gaps` (BigQueryOperator)
   ```sql
   SELECT search_term, gap_score
   FROM trends.gap_analysis
   WHERE gap_score >= 8.0
   ORDER BY gap_score DESC
   LIMIT 5
   ```

4. `format_slack_message` (PythonOperator)
   ```python
   message = f"""
   🔥 *Top 10 Trends (US Market)*
   {format_trends(top_10)}
   
   📈 *Fastest Rising Trends*
   {format_trends(rising)}
   
   ⚠️ *Content Gaps to Address*
   {format_gaps(gaps)}
   """
   ```

5. `send_to_slack` (SlackWebhookOperator)
   ```python
   slack_webhook.send(
       channel='#tmp_trend_tool_v2',
       text=message
   )
   ```

### 9.3 PubSub Integration

**Topic**: `trend-enriched`  
**Purpose**: Event-driven architecture (decouple enrichment from downstream consumers)

**Subscribers**:
1. **Gap Analyzer**: Triggered when new trends are enriched
2. **Slack Bot**: Real-time alerts for severity_score >9
3. **PowerBI**: Refresh dashboard on new data availability

**Message Format**:
```json
{
  "trend_id": "abc123",
  "search_term": "Warhammer 40k",
  "severity_score": 9,
  "timestamp": "2025-01-15T02:15:00Z"
}
```

### 9.4 Error Handling

**Dead-Letter Queue** (DLQ): `trend-enrichment-dlq`  
**Purpose**: Capture failed Gemini API calls for manual review

**Retry Logic**:
- 1st attempt: Immediate
- 2nd attempt: 5 minutes delay
- 3rd attempt: 15 minutes delay
- After 3 failures: Send to DLQ + Slack alert

**Monitoring**:
- Cloud Logging: All Airflow DAG logs
- Cloud Monitoring: Alert if error rate >5%
- Weekly review: Bartosz Klocek checks DLQ for pattern identification

---

## 10. Use Cases

### 10.1 Use Case 1: BizDev Licensing Prioritization

**Persona**: Ozan Tuzun (Head of Marketplace / BizDev Lead)  
**Goal**: Decide which IP licensing deals to prioritize in Q1 2026

**Current Process** (Manual, 15 hours/week):
1. Browse gaming news sites (IGN, Polygon, Kotaku) for trending IPs
2. Check Google Trends manually for 10-15 keywords
3. Estimate Displate demand based on gut feel
4. Prioritize deals based on personal familiarity with IP

**Pain Points**:
- Reactive: Licensing discussions start after mainstream hype (too late)
- Subjective: Decisions influenced by personal preferences vs. data
- Incomplete: Misses niche opportunities outside Ozan's awareness

**Trend Intelligence Solution**:

**Monday, 9:00 AM CET**: Ozan receives Slack digest in #tmp_trend_tool_v2
```
🔥 Top 10 Trends (US Market)

1. Warhammer 40k (Score: 9/10) - Space Marine 2 launch driving 450% search growth
2. Elden Ring (Score: 8/10) - DLC announcement speculation peaking
3. Baldur's Gate 3 (Score: 7/10) - Game Awards nomination sustained interest
...

⚠️ Content Gap Alerts

• Warhammer 40k: Only 23 artworks vs. estimated demand for 200+
  💡 Recommendation: Prioritize Games Workshop licensing deal
```

**9:15 AM**: Ozan opens Streamlit UI → Gap Analysis tab
- Sorts by Gap Score (descending)
- Sees Warhammer 40k: Gap Score 9.2, Severity 9, Internal Search 450 queries/week
- Clicks trend → Drill-down shows:
  - 23 existing artworks (all unlicensed fan art)
  - HubSpot status: No active deal
  - Estimated revenue opportunity: $50K+ in Q1 if licensed content launched

**9:30 AM**: Ozan creates HubSpot deal
- Deal name: "Games Workshop - Warhammer 40k Licensing"
- Priority: High
- Next step: Research contact at Games Workshop (LinkedIn enrichment - future feature)

**Outcome**:
- Decision time: 30 minutes (vs. 3-4 hours manual research)
- Data-driven: Gap score of 9.2 objectively prioritizes Warhammer over other IPs
- Proactive: Licensing outreach begins while trend is rising, not declining

### 10.2 Use Case 2: Marketplace UGC Curation

**Persona**: Łukasz Konofalski (Marketplace Lead)  
**Goal**: Approve fan art submissions efficiently while filling content gaps

**Current Process** (Manual, 8 hours/week):
1. Review 100-200 artwork submissions per day
2. Approve based on quality + gut feel about demand
3. Manually search catalog to check for IP saturation

**Pain Points**:
- Inconsistent: Some trending IPs get overlooked, others oversaturated
- Time-consuming: No systematic way to identify high-priority gaps
- Reactive: Approves fan art after mainstream hype (traffic already declining)

**Trend Intelligence Solution**:

**Daily, 10:00 AM CET**: Łukasz checks Gap Analysis dashboard
- Filter: Gap Score >7.0, Category = Gaming
- Sees "Elden Ring" with Gap Score 8.5
  - Current catalog: 127 artworks (high saturation)
  - Recent uploads: 87 pending fan art submissions
  - Recommendation: Fast-track approvals to capitalize on DLC hype

**Łukasz's workflow**:
1. Opens artwork moderation queue
2. Filters submissions by "Elden Ring" tag
3. Batch approves 50 high-quality submissions (vs. normal 10/day trickle)
4. Schedules featured collection: "Elden Ring: Shadow of the Erdtree Fan Art"

**Tuesday, 2:00 PM CET**: Marketing launches Instagram campaign highlighting Elden Ring collection
- Timing aligned with trend peak (Gap Analyzer shows trend still rising)
- Conversion rate: 3.2% (vs. 1.8% baseline for non-trend collections)

**Outcome**:
- Revenue: $18K additional sales in Week 1 (vs. $6K baseline)
- Efficiency: 30 minutes curation decision (vs. 3 hours manual research)
- Proactive: Content available during trend peak, not post-hype decline

### 10.3 Use Case 3: Marketing Campaign Timing

**Persona**: Marina Krajnovic (Influencer Marketing Lead)  
**Goal**: Time influencer partnerships to align with peak trend velocity

**Current Process** (Manual, 5 hours/week):
1. Negotiate influencer deals 2-3 months in advance
2. Lock in campaign dates based on influencer availability
3. Hope trending topics align with scheduled posts (often misaligned)

**Pain Points**:
- Misalignment: Campaign launches after trend peaks (wasted budget)
- Inflexibility: Contracts signed before trend data available
- Missed opportunities: High-velocity trends ignored due to planning lag

**Trend Intelligence Solution**:

**Week 1**: Marina reviews Trend Comparison tool (Streamlit UI)
- Compares 3 IPs for upcoming campaign:
  - Dune (declining -15% WoW, severity 5)
  - The Last of Us Season 2 (rising +320% WoW, severity 8)
  - Baldur's Gate 3 (stable, severity 7)

**Marina's decision**:
- **Pivot**: Cancel planned Dune campaign (trend declining)
- **Prioritize**: Fast-track The Last of Us influencer outreach
- **Budget**: Reallocate $15K from Dune to Last of Us

**Week 2**: Influencer campaign launches
- 4 gaming influencers post Last of Us content
- Campaign runs during trend peak (severity 8, search volume 2,500/day)
- Conversion tracking: 1,200 orders attributed to influencer campaign

**Outcome**:
- ROAS: 3.8x (vs. 1.2x for typical influencer campaigns)
- Efficiency: Real-time trend data enabled mid-planning pivot
- Revenue: $45K campaign revenue (vs. estimated $12K if Dune campaign proceeded)

### 10.4 Use Case 4: Artist Recruitment (🔮 Future)

**Persona**: Natalie Tyler (Artist Acquisition Lead)  
**Goal**: Recruit artists with portfolios matching trending IPs

**Current Process** (Manual, 12 hours/week):
1. Browse DeviantArt, ArtStation manually for talented artists
2. Search by generic tags ("fantasy art," "sci-fi art")
3. Review 200+ portfolios to find 5-10 suitable candidates
4. Cold outreach via platform DMs (low response rate ~8%)

**Pain Points**:
- Time-consuming: 12 hours to recruit 5 artists per week
- Unfocused: Searches not aligned with Displate demand
- Low conversion: Generic outreach yields poor response rates

**Trend Intelligence Solution** (Reference Asset Aggregator + Content Outreach Agent):

**Monday, 9:00 AM CET**: Trend digest highlights Warhammer 40k (Gap Score 9.2)

**Automated workflow** (Content Outreach Agent):
1. **Identify Trend**: Warhammer 40k (severity 9, gap score 9.2)
2. **Scrape ArtStation**: Query "Warhammer 40k fan art" (last 30 days)
   - Finds 87 portfolios with Warhammer artwork
3. **Filter Artists**:
   - CLIP embedding similarity to Displate's style (cosine >0.85)
   - Upload frequency >2 artworks/month (active creators)
   - Social following >5K (marketing reach)
4. **Rank Artists**: Top 10 candidates based on composite score
5. **LinkedIn Enrichment** (PRIORITY #4): Fetch artist contact info (email, LinkedIn profile)
6. **Personalized Outreach**:
   ```
   Subject: Displate Partnership - Your Warhammer 40k Artwork

   Hi [Artist Name],

   We noticed your incredible Warhammer 40k artwork on ArtStation! 
   Displate is partnering with Games Workshop for licensed metal posters, 
   and your style perfectly matches what our community loves.

   Would you be interested in a commission or ongoing partnership?

   [Portfolio examples auto-attached]
   ```

**Outcome**:
- Time savings: 80% reduction (12 hours → 2 hours/week)
- Conversion: 25% response rate (vs. 8% manual outreach)
- Revenue: $8K/month from 10 recruited artists creating Warhammer content

---

## 11. Development Roadmap

### Phase 1: Foundation ✅ COMPLETE
**Timeline**: November 2024 - January 2025  
**Owner**: Bartosz Klocek (Data Engineering), Tomasz Tomczyk (Slack Bot)

**Deliverables**:
- [x] Google Trends crawler (daily scraping, US/Germany markets)
- [x] dbt ETL pipeline (data structuring, deduplication)
- [x] Gemini AI enrichment (entity extraction, severity scoring)
- [x] BigQuery storage (`analytics-324613.trends.*`)
- [x] Slack bot (weekly digests to #tmp_trend_tool_v2)

**Status**: Operational with limitations (Google Trends only, prompt refinement ongoing)

### Phase 2: Self-Service UI 🚧 IN PROGRESS
**Timeline**: January 2025 - March 2025 (12 weeks)  
**Owner**: Bartosz Klocek + Maria (to be assigned)

**Deliverables**:
- [ ] Streamlit dashboard (4 pages: Dashboard, Trend Explorer, Gap Analysis, Comparison)
- [ ] Google Cloud Run deployment (containerized, OAuth authentication)
- [ ] UAT with BizDev and Marketplace teams (Week 10-11)
- [ ] Production launch (Week 12)

**Milestones**:
- Week 4: Dashboard + Trend Explorer pages functional
- Week 8: Gap Analysis tab operational (basic version)
- Week 10: UAT feedback incorporated
- Week 12: Production launch

**Dependencies**: None (Gap Analyzer not required for basic UI)

### Phase 3: Content Gap Automation 🚧 NEXT
**Timeline**: February 2025 - April 2025 (10 weeks, parallel with Phase 2)  
**Owner**: Michał Bielacki (with Bartosz Klocek support)

**Deliverables**:
- [ ] **PRIORITY #1**: Internal search data integration (BigQuery join)
- [ ] **PRIORITY #2**: Brand list integration (catalog.brands table)
- [ ] **PRIORITY #3**: HubSpot API integration (deal status, brand negotiations)
- [ ] Gap score calculation algorithm (dbt model)
- [ ] PowerBI dashboard (Gap Analysis reports)
- [ ] Automated Slack alerts (high-priority gaps, score >8.0)

**Milestones**:
- Week 2: Search data integration complete
- Week 4: Brand list matching operational
- Week 6: HubSpot API prototype (first 10 deals)
- Week 8: Gap score algorithm validated (manual testing)
- Week 10: PowerBI dashboard live, Slack alerts enabled

**Dependencies**:
- Search data schema clarification (temporal matching vs. aggregation)
- HubSpot API credentials (BizDev team)
- PowerBI workspace access

### Phase 4: Multi-Source Expansion 🔮 LATER
**Timeline**: Q2 2025 - Q4 2025 (staggered releases)  
**Owner**: Bartosz Klocek (crawlers), Waligóra (LinkedIn enrichment)

**Q2 2025** (April - June):
- [ ] SteamDB crawler (gaming trends, daily player counts)
- [ ] IMDB/TMDB crawler (movie/TV releases, 6-12 month pipeline)

**Q3 2025** (July - September):
- [ ] Anime database crawler (MyAnimeList, AniList)
- [ ] **PRIORITY #4**: LinkedIn enrichment (licensor contact data)
- [ ] Reddit crawler (subreddit analytics)

**Q4 2025** (October - December):
- [ ] Spotify crawler (music/band trends)
- [ ] Multi-source trend correlation (identify co-trending IPs)

**Rationale**: Staggered to avoid overloading AI enrichment pipeline (Gemini API costs scale linearly)

### Phase 5: Content Ecosystem Automation 🔮 LATER
**Timeline**: Q4 2025 - Q1 2026  
**Owner**: Waligóra (lead), Justin (support), Bartosz Klocek (technical)

**Deliverables**:
- [ ] Reference Asset Aggregator (DeviantArt, ArtStation, Reddit scraping)
- [ ] Artist recommendation engine (CLIP embeddings, portfolio matching)
- [ ] Catalog Enhancement Engine (retroactive metadata tagging)
- [ ] Content Outreach Agent (automated licensor contact mapping, email outreach)

**HIGH RISK ITEMS**:
- **Legal Review Required**: Reference Asset Aggregator (copyright compliance)
- **BizDev Workflow Mapping**: Content Outreach Agent (automation boundaries)

**Approval Gate**: Legal and BizDev sign-off before development begins

---

## 12. Security & Governance

### 12.1 Data Access Control

**BigQuery Permissions**:
- **Read-Only** (All Displate employees)
  - Tables: `trends.enriched_trends`, `trends.gap_analysis`
  - Tools: BigQuery console, Streamlit UI, PowerBI
- **Write Access** (Analytics team only)
  - Tables: `trends.raw_trends`, `trends.structured_trends`
  - Tools: Airflow DAGs, dbt models

**Streamlit UI Authentication**:
- Google OAuth (restrict to @displate.com emails)
- No anonymous access
- Session timeout: 8 hours

### 12.2 API Key Management

**Gemini API Key**:
- Storage: Google Secret Manager
- Rotation: Every 90 days (automated)
- Access: Cloud Functions service account only

**HubSpot API Key** (Future):
- Storage: Google Secret Manager
- Rotation: Manual (aligned with HubSpot security policy)
- Access: Gap Analyzer DAG service account

**Audit Log**:
- All API calls logged to Cloud Logging
- Monthly review by Mateusz Waligórski

### 12.3 Data Quality & Validation

**dbt Tests** (Automated):
```yaml
# models/staging/stg_trends.yml
models:
  - name: stg_trends
    tests:
      - unique:
          column_name: "trend_id"
      - not_null:
          column_name: "search_term"
      - accepted_values:
          column_name: "geo"
          values: ['US', 'DE']
```

**Enrichment Quality**:
- Manual validation: 20 random trends reviewed weekly (Bartosz Klocek)
- Target accuracy: >85%
- Alert: If error rate >10%, pause enrichment pipeline for review

**Anomaly Detection**:
- Monitor trend_value outliers (>100 or <0)
- Alert: If >5% of trends fail validation, Slack notification to #analytics-data-and-reports

### 12.4 GDPR Compliance

**Data Sources**:
- Google Trends: Aggregated public data (no PII)
- Internal Search: Anonymized query text (no user_id linkage in trend system)
- HubSpot: Business contact data (B2B, GDPR-compliant)
- LinkedIn: Public profile data (scraping policy compliance TBD)

**Artist Data** (Future - Reference Asset Aggregator):
- Portfolio URLs: Publicly accessible (no login required)
- Artist names/emails: Requires consent before outreach
- GDPR: Right to be forgotten (delete artist contact data on request)

### 12.5 Disaster Recovery

**Backup Strategy**:
- BigQuery tables: 7-day automatic snapshots
- GCS raw data: 90-day retention policy
- Airflow DAGs: Version-controlled in GitLab (main branch = source of truth)

**Recovery Time Objective (RTO)**: 4 hours  
**Recovery Point Objective (RPO)**: 24 hours (daily backups)

**Incident Response**:
1. Detect: Cloud Monitoring alerts (#analytics-data-and-reports Slack)
2. Assess: Mateusz Waligórski determines severity
3. Restore: BigQuery snapshot rollback (if data corruption)
4. Postmortem: Document root cause, prevent recurrence

---

## 13. Appendices

### 13.1 Glossary

**Trend**: A search term or IP experiencing measurable increase in public interest, tracked via Google Trends or other data sources.

**Severity Score**: AI-generated metric (1-10 scale) representing market potential for Displate, where 10 = highest revenue opportunity (e.g., major franchise release).

**Gap Score**: Composite metric (0-10 scale) quantifying content opportunity based on:
- Trend severity (market demand)
- Internal search volume (validated user interest)
- Catalog coverage (existing artwork availability)
- Licensing feasibility (HubSpot deal status)

**Enrichment**: AI-powered analysis (via Gemini LLM) extracting named entities, sentiment, severity score, and market potential from raw trend data.

**Content Gap**: Situation where high-severity trend exists (e.g., Warhammer 40k) but Displate catalog has insufficient artwork to capture demand (gap score >7.0).

### 13.2 BigQuery Schema Reference

#### Table: `trends.raw_trends`
```sql
CREATE TABLE trends.raw_trends (
  id STRING,  -- UUID
  search_term STRING,
  trend_value INT64,  -- Google Trends score (0-100)
  category STRING,  -- 'Gaming', 'Pop Culture', etc.
  geo STRING,  -- 'US', 'DE'
  timestamp TIMESTAMP,
  created_at TIMESTAMP
)
PARTITION BY DATE(timestamp)
CLUSTER BY category, geo;
```

#### Table: `trends.enriched_trends`
```sql
CREATE TABLE trends.enriched_trends (
  id STRING,
  search_term STRING,
  trend_value INT64,
  category STRING,
  geo STRING,
  timestamp TIMESTAMP,
  enrichment JSON,  -- {entities, sentiment, severity_score, market_potential}
  enriched_at TIMESTAMP,
  created_at TIMESTAMP
)
PARTITION BY DATE(timestamp)
CLUSTER BY category, geo;
```

#### Table: `trends.gap_analysis`
```sql
CREATE TABLE trends.gap_analysis (
  trend_id STRING,
  search_term STRING,
  gap_score FLOAT64,  -- 0-10 composite metric
  severity_score INT64,  -- From enrichment
  internal_search_volume INT64,  -- Last 30 days
  catalog_coverage_pct FLOAT64,  -- % of estimated demand met
  hubspot_deal_status STRING,  -- 'Active', 'Closed', 'None'
  recommended_action STRING,  -- 'Licensing', 'UGC Curation', 'Artist Recruitment'
  created_at TIMESTAMP
)
PARTITION BY DATE(created_at)
CLUSTER BY gap_score DESC;
```

#### Table: `trends.hubspot_deals`
```sql
CREATE TABLE trends.hubspot_deals (
  deal_id STRING,
  brand_name STRING,
  deal_stage STRING,  -- 'Negotiation', 'Closed-Won', etc.
  created_date DATE,
  updated_at TIMESTAMP
)
CLUSTER BY brand_name;
```

### 13.3 Contact & Support

**Primary Owner**: Mateusz Waligórski (Head of Analytics)  
**Email**: mateusz.waligora@displate.com  
**Slack**: @Waligóra

**Module Owners**:
- Trend Crawler: Bartosz Klocek (@Bartosz Klocek)
- Trend ETL: Bartosz Klocek (@Bartosz Klocek)
- Slack Bot: Tomasz Tomczyk (@Tomasz Tomczyk)
- Gap Analyzer: Michał Bielacki (@Michał Bielacki)
- Streamlit UI: Bartosz Klocek + Maria (@Maria)
- Content Outreach: Waligóra (@Waligóra) + Justin (@Justin)

**Support Channels**:
- Slack: #analytics-data-and-reports (general questions)
- Slack: #tmp_trend_tool_v2 (trend digest, user feedback)
- Jira: BIU project (bug reports, feature requests)

### 13.4 FAQ

**Q1: Why only Google Trends in Phase 1?**  
**A**: Google Trends provides 80% of the value with 20% of the effort. It's free, reliable, and covers broad market signals. Multi-source expansion (SteamDB, TMDB) is planned for Phase 4 once foundation is proven.

**Q2: How accurate is Gemini enrichment?**  
**A**: Manual validation shows 85-90% accuracy for entity extraction and severity scoring. We review 20 random trends weekly and refine prompts based on errors.

**Q3: Can I request custom trends to track?**  
**A**: Yes! Contact Bartosz Klocek to add specific search terms to the crawler. Note: Google Trends rate limits require prioritization (max ~200 terms/day).

**Q4: Why is internal search data PRIORITY #1?**  
**A**: Google Trends shows external market interest, but Displate's internal search data validates that *our users* actually want that content. Gap score is meaningless without demand validation.

**Q5: How much does this system cost to run?**  
**A**: ~$150/month total:
- Google Trends: Free
- Gemini API: ~$50/month (2,500 trends × $0.02/1K)
- BigQuery: ~$30/month (storage + queries)
- Cloud Run: ~$20/month (Streamlit UI hosting)
- Airflow: $50/month (GCP Composer instance)

**Q6: What if a trend is flagged incorrectly?**  
**A**: Report false positives in #tmp_trend_tool_v2. We log all errors and retrain prompts monthly. You can also query `trends.enrichment_errors` in BigQuery to review failures.

**Q7: Can Marketing team edit trend data?**  
**A**: No. Trend data is read-only for all non-Analytics employees to ensure data integrity. If you need corrections, Slack #analytics-data-and-reports.

**Q8: When will LinkedIn enrichment be available?**  
**A**: Q3 2025 (Phase 4). This feature requires legal review of web scraping policies and GDPR compliance for storing contact data.

### 13.5 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 25, 2025 | Mateusz Waligórski | Initial specification based on Phase 1 completion |
| 2.0 | Nov 25, 2025 | Mateusz Waligórski | Added Slack channel updates, priority action items, ownership clarification |

---

**Document End**

For questions or feedback, contact Mateusz Waligórski (@Waligóra) or post in #analytics-data-and-reports.
