# Trend Tool Roadmap & Kanban

> Last updated: 2024-12-16
> Status: DRAFT - Pending validation

---

## Executive Summary

Transform the Trend Tool from a basic weekly report into an actionable intelligence system with:
- Cascade logic (brand → Hubspot → marketplace → validation queue)
- Interactive Slack buttons with accountability tracking
- Multi-category support (Games, Movies, TV, Anime)
- Urgency mechanics (day counters, aging alerts)

---

## Kanban Board

### ✅ DONE (Current State)

| Item | Notes |
|------|-------|
| Google Trends data pipeline | `analytics-324613.trendtool_export.google_trends_enriched` |
| BigQuery ETL (dbt) | Owned by Bartosz Klocek |
| Weekly Slack report | Tuesdays 11:00 UTC → `#tmp_trend_tool_v2` |
| Basic LLM analysis | "CEO's Edge" prompt, Gemini via Vertex AI |
| Competitor link generation | Displate, RedBubble, DeviantArt, ArtStation, AllPosters |
| Report storage | Postgres `ttool.trend_tool_reports` |
| Chatbot with memory | Thread-scoped, BigQuery + Postgres tools |
| Chat memory persistence | Postgres `ttool.trend_tool_chat_memory` |

---

### 🚧 IN PROGRESS

| Item | Owner | Notes |
|------|-------|-------|
| Documentation overhaul | Waligóra | This session - spec, dev docs, roadmap |

---

### 📋 BACKLOG (Prioritized)

#### Phase 2A: Data Layer Enhancements
*Prerequisites: None*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 2A.1 | Expand category filter (GAMES → all 4) | Low | BigQuery query update |
| 2A.2 | Add `trend_age_days` calculation | Low | BigQuery query update |
| 2A.3 | Create brand catalog lookup table | Medium | Need brand list from BizDev |
| 2A.4 | Marketplace search integration | Medium | Algolia or internal search API |
| 2A.5 | Validation queue search integration | Medium | Admin panel API or direct DB |
| 2A.6 | Internal search data integration | Medium | GA4 BigQuery export (`analytics-324613.analytics_*`) |
| 2A.7 | Search term normalization layer | Medium | 2A.6 - fuzzy match trend names to search queries |

#### Phase 2B: LLM Node Restructure
*Prerequisites: 2A.1 complete*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 2B.1 | Build `trend_enricher` node | Medium | Prompt engineering |
| 2B.2 | Build `relevance_classifier` node | Medium | Prompt engineering |
| 2B.3 | Remove/replace "CEO's Edge" prompt | Low | After 2B.1, 2B.2 tested |

#### Phase 2C: Cascade Logic & Gap Analysis
*Prerequisites: 2A.3-2A.7 complete, 2B.1 complete*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 2C.1 | Build `brand_catalog_lookup` node | Low | 2A.3 |
| 2C.2 | Build `marketplace_search` node | Medium | 2A.4 |
| 2C.3 | Build `validation_queue_search` node | Medium | 2A.5 |
| 2C.4 | Build `content_gap_lookup` node | Low | Content gaps table (TBD) |
| 2C.5 | Build `internal_search_matcher` node | High | 2A.6, 2A.7, 2B.1 |
| 2C.6 | Build `demand_supply_gap_calculator` node | High | 2C.1-2C.5 |
| 2C.7 | Cascade orchestrator (combine all results) | Medium | 2C.6 |

**2C.5 `internal_search_matcher`** - Core matching logic:
- Input: Enriched trend (ip_name, characters[], themes[])
- Query: GA4 search data for matching terms
- Output: `{ search_volume_30d, search_rank, top_queries[], conversion_rate }`

**2C.6 `demand_supply_gap_calculator`** - Gap scoring:
- Input: All cascade results (brand, marketplace, validation, internal search)
- Logic: Cross-reference external signal (Google Trends) with internal demand (GA4 search) and supply (marketplace + validation)
- Output:
```json
{
  "trend": "Blue Lock",
  "external_signal": { "google_trends_score": 85, "growth_7d": "+195%" },
  "internal_demand": { "search_volume_30d": 2400, "search_rank": 47, "top_queries": ["blue lock", "blue lock anime", "isagi"] },
  "supply": { "marketplace_count": 5, "validation_queue": 23 },
  "coverage": { "has_brand": false },
  "gap_assessment": "HIGH_OPPORTUNITY",
  "gap_reasoning": "High external + internal demand, minimal supply, no license coverage"
}
```

#### Phase 3: Slack Output Overhaul
*Prerequisites: 2C.7 complete*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 3.1 | Design Block Kit message template | Medium | Slack Block Kit Builder |
| 3.2 | Implement interactive buttons | Medium | Slack App config (interactivity URL) |
| 3.3 | Build button handler workflow | High | New n8n workflow |
| 3.4 | Action tracking database schema | Medium | Postgres table design |
| 3.5 | Implement day counter / aging display | Low | After 2A.2 |
| 3.6 | URL template standardization | Low | Define patterns for all links |

#### Phase 4: Chatbot Enhancements
*Prerequisites: Phase 3 complete (can run in parallel)*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 4.1 | Add `/trends today` slash command | Medium | Slack App slash command config |
| 4.2 | Add `/trends research "X"` command | Medium | New workflow branch |
| 4.3 | Update chatbot system prompt | Low | After cascade data available |
| 4.4 | Add cascade data to chatbot tools | Medium | Reuse 2C nodes |

#### Phase 5: Polish & Integration
*Prerequisites: Phase 3-4 complete*

| # | Item | Complexity | Dependencies |
|---|------|------------|--------------|
| 5.1 | Combine workflows (if desired) | Medium | All workflows tested |
| 5.2 | Production channel migration | Low | Stakeholder approval |
| 5.3 | Monitoring & alerting | Medium | Error handling, logging |
| 5.4 | User training / documentation | Low | Final docs |

---

### 🚫 BLOCKED

| Item | Blocked By | Action Needed |
|------|------------|---------------|
| Brand catalog lookup (2A.3) | No brand list table | Get brand list from BizDev or create mapping |
| Validation queue (2A.5) | Unknown API/access | Confirm with Marketplace team |
| Content gaps table (2C.4) | Table doesn't exist? | Confirm data source with Michał Bielacki |

---

### ❄️ ICE BOX (Future / Out of Scope for Now)

| Item | Rationale |
|------|-----------|
| **Hubspot deals/contacts sync** | Defer until core cascade working; adds complexity |
| **Hubspot deal lookup node** | Depends on Hubspot sync |
| Automated outreach drafting | Phase 4-5 territory, need cascade working first |
| Escalation automation | Keep simple for now (buttons only, no auto-escalate) |
| Multi-agent orchestration | Overkill until basics proven |
| SteamDB / IMDB / anime DB integration | Future data sources, not MVP |
| Predictive trending | Needs historical data analysis first |

---

## Proposed Milestone Schedule

| Milestone | Target | Deliverables |
|-----------|--------|--------------|
| **M1: Docs Complete** | Week 1 | System Spec v3, Dev Docs, Executive Summary |
| **M2: Data Layer Ready** | Week 2-3 | Phase 2A complete, all lookups working |
| **M3: Cascade Working** | Week 4-5 | Phase 2B + 2C complete, cascade tested |
| **M4: Interactive Slack** | Week 6-7 | Phase 3 complete, buttons working |
| **M5: Chatbot Enhanced** | Week 8 | Phase 4 complete |
| **M6: Production Ready** | Week 9-10 | Phase 5 complete, go-live |

*Note: Timeline assumes ~10-15 hours/week allocation. Adjust based on actual availability.*

---

## Critical Path

```
2A.1 (categories) ─────────────────────────────────────────────────────────────┐
2A.2 (trend age)  ─────────────────────────────────────────────────────────────┤
                                                                               │
2A.3 (brand list) ──► 2C.1 (brand lookup) ─────────────────────────────────────┤
2A.4 (marketplace)──► 2C.2 (marketplace search) ───────────────────────────────┤
2A.5 (validation) ──► 2C.3 (validation search) ────────────────────────────────┼──► 2C.6 (gap calc) ──► 2C.7 (orchestrator) ──► 3.1-3.6 (Slack)
                      2C.4 (content gaps) ─────────────────────────────────────┤
2A.6 (GA4 search) ──► 2A.7 (normalization) ──► 2C.5 (search matcher) ──────────┤
                                                                               │
2B.1 (enricher)   ──► 2C.5 (search matcher) ───────────────────────────────────┤
2B.2 (classifier) ──► 2C.7 (orchestrator) ─────────────────────────────────────┘
```

**Longest path:** 2A.6 → 2A.7 → 2C.5 → 2C.6 → 2C.7 → 3.2 → 3.3 (GA4 search integration through to Slack buttons)

**Quickest wins:**
1. 2A.1 (category expansion) - immediate, no dependencies
2. 2A.2 (trend age) - immediate, no dependencies
3. 3.6 (URL templates) - can standardize now
4. 2A.6 (GA4 search query) - if you know the table schema already

---

## Open Questions

1. **Brand list source**: Does a BigQuery table with brand/IP names exist? Or need to create manually?

2. **Validation queue access**: Direct Postgres query? Admin API? Who owns this?

3. **Content gaps table**: Spec mentions it - does `content_gaps` table exist? Schema?

4. **Slack App permissions**: Current app has interactivity enabled? Or need new app?

5. **Who reviews button actions?**: BizDev team? Marketplace team? Both?

6. **GA4 search data schema**: Which table/view has internal search queries? Likely `analytics-324613.analytics_*.events_*` with `event_name = 'search'`? Need exact field names for search term, timestamp, user_id.

7. **Search term normalization**: How fuzzy should matching be? Exact match? Contains? Levenshtein distance? (e.g., "blue lock" should match "bluelock", "Blue Lock S2", "isagi blue lock")

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Validation queue no API | Blocks 2A.5 | Direct DB read as fallback |
| Slack button URL routing | Blocks Phase 3 | Verify n8n webhook accessibility |
| LLM inconsistent output | Bad data downstream | Structured output + validation |
| Scope creep | Timeline slip | Stick to phases, defer to Ice Box |
| GA4 schema changes | Breaks search matcher | Document schema, add monitoring |

---

## Success Criteria

### MVP (Milestone 4)
- [ ] Weekly report shows trends from all 4 categories
- [ ] Each trend shows cascade status (brand ✓/✗, marketplace count, validation count)
- [ ] Each trend shows internal search demand (volume, rank)
- [ ] **Gap assessment visible** (HIGH_OPPORTUNITY / MEDIUM / LOW / COVERED)
- [ ] Day counter visible on each trend
- [ ] Interactive buttons work (at least "I'm on it" + "Not for us")
- [ ] Button clicks logged to database

### Full Release (Milestone 6)
- [ ] All 4 buttons functional with proper tracking
- [ ] Chatbot responds to slash commands
- [ ] Chatbot can query demand-supply gaps on demand
- [ ] Production Slack channel active
- [ ] Documentation complete
- [ ] At least 2 weeks of stable operation

---

## Notes

- Build workflows separately, combine after testing
- Prompt rewrite comes AFTER cascade data available (no point writing prompt for data that doesn't exist yet)
- Chatbot enhancements can run parallel to Slack output work
- Sports category intentionally excluded (flooding risk) - revisit later
