# Trend Tool Chatbot v2 — Domain Expert Mode

## Overview

This chatbot treats users as domain experts expecting GPT-like answers specialized to Displate's trend intelligence needs. Every query gets a structured response based on 7 predefined patterns.

## Query Types & Expected Responses

### 1. DEEP_DIVE — "Tell me about X"
**Triggers:** `tell me about`, `what is`, `what about`, `more about`

**Example queries:**
- "Tell me more about Silent Hill F"
- "What is Silent Hill game?"
- "What about Tides of Annihilation"

**Response template:**
```
📊 [Title] — Trend Analysis

Category: 🎮 Games
IP: [franchise name]
─────────────────────
📈 Trend Status
• Score: 78/100 🔥
• Freshness: Rising
• Age: 12 days

🎯 Displate Opportunity
• Searches: 2.3k/month
• Catalog: 47 designs
• Gap: 🟡 WATCH

💡 Context
[AI-generated summary]

📋 Recommendation
[Action guidance]
```

### 2. COMPARISON — "X vs Y"
**Triggers:** `vs`, `versus`, `or`, `compare`, `which is better`

**Example queries:**
- "Warframe vs Crusader Kings"
- "Should we invest in Warframe or Crusader Kings fandom?"

**Response template:**
```
⚖️ [Entity1] vs [Entity2]

| Metric | Entity1 | Entity2 |
|--------|---------|---------|
| Score  | 65 📈   | 42 ➡️   |
| Searches| 1.9k   | 620     |
| Catalog | 234    | 89      |
| Gap    | 🔴 Sat  | 🟢 High |

💡 My Take
• Higher momentum: Entity1
• Better gap opportunity: Entity2
```

### 3. SIZING — "How big is X?"
**Triggers:** `how big`, `how popular`, `fandom size`, `market size`

**Example queries:**
- "How big is Clair Obscur's fandom?"
- "How popular is Path of Exile 2?"

**Response template:**
```
📏 [Title] — Fandom Size Estimate

Overall: 🔶 Medium Fandom

📊 Trend Signals
• Google Score: 45/100 (above category avg of 38)
• Displate Searches: 180/month (below avg of 500)
• Category: 🎮 Games

💡 Context
[Comparable fandoms at similar stage]

Verdict: [Size assessment + risk/reward]
```

### 4. OPINION — "What do you think?"
**Triggers:** `what do you think`, `should we invest`, `worth it`, `recommend`, `your take`

**Example queries:**
- "What do you think about Path of Exile 2?"
- "What do you think about Claire Obscur 33"

**Response template:**
```
💭 My Take on [Title]

✅ Strong opportunity. High momentum with catalog gap. Worth pursuing.

Numbers:
• Score: 72 📈
• Searches: 1.2k/mo
• Catalog: 23 designs
• Gap: 🟢 HIGH_OPPORTUNITY

⚠️ Based on trend data only. Licensing costs not factored.
```

### 5. SEARCH — "Any mentions of X?"
**Triggers:** `any mention`, `search for`, `find`, `do we have`, `look up`

**Example queries:**
- "Any mentions of Dispatch?"
- "Do we have data on Monster Hunter?"

**Response template:**
```
🔍 Search Results: "Dispatch"

Found 3 matches:

1. Dispatch Protocol — 67 🔥 | 🟢 HIGH
2. Dispatch: Crime Stories — 42 ➡️ | 🟡 WATCH
3. The Dispatch — 28 📉 | 🔴 SATURATED

Ask "tell me about [name]" for details.
```

### 6. CALENDAR — "Upcoming titles?"
**Triggers:** `upcoming`, `coming soon`, `releases`, `new titles`, `what's next`

**Example queries:**
- "Any big upcoming titles in gaming?"
- "New movie releases this month?"

**Response template:**
```
🗓️ Upcoming & Rising — 🎮 Games

| Title | Score | Coverage | Gap |
|-------|-------|----------|-----|
| GTA 6 | 95 🔥 | 12 | 🟢 |
| Monster Hunter | 82 📈 | 34 | 🟡 |
| Clair Obscur | 45 ➡️ | 0 | 🟢 |

🎯 Biggest Gaps: Clair Obscur, Death Stranding 2
```

### 7. NEWS — Events/Deals (Can't answer)
**Triggers:** `free`, `deal`, `sale`, `discount`, `epic store`, `announced`, `did it detect`

**Example queries:**
- "Did it detect that Hogwarts Legacy is free on Epic Store?"
- "Any news about the Nintendo Direct?"

**Response template:**
```
📰 News Query — Outside My Scope

I track trend momentum, not real-time news or deals.

For news:
• 🎮 Epic Free Games: store.epicgames.com/free-games
• 🔥 r/GameDeals: reddit.com/r/GameDeals
• 📰 PC Gamer: pcgamer.com

What I CAN do: Ask "tell me about Hogwarts Legacy" for trend data.
```

### 8. REGIONAL — "Top trends in DE?"
**Triggers:** `in DE`, `in Germany`, `German market`, `top in [country]`

**Example queries:**
- "What are the top movie trends in DE this week?"
- "Trending games in Poland?"

**Response template:**
```
🌍 Top Trends in Germany — 🎬 Movies

1. Gladiator 2 — 85 🔥
2. Wicked — 72 📈
3. Moana 2 — 68 📈
...
```

---

## NOT FOUND Response (Critical for UX)

When entity isn't in our database:

```
🔍 Tides of Annihilation — Not in Trend Database

I don't have trend data for this title. This usually means:
• Too new/niche to appear in Google Trends
• Different spelling in our system
• Regional trend not captured

Where to check:
• 🎮 SteamDB: steamdb.info/search/?q=tides+of+annihilation
• 📈 Google Trends: trends.google.com/trends/explore?q=...
• 🎬 IMDB: imdb.com/find?q=...

Want me to track this?
React with 👀 and I'll flag it for manual review.
```

---

## Architecture Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Query Classifier│ → Pattern match → 7 types
└────────┬────────┘
         │
    Low confidence?
         │
    ┌────┴────┐
    │    │    │
    ▼    │    ▼
┌──────┐ │ ┌──────────┐
│ LLM  │ │ │ Direct   │
│Parse │ │ │ to Query │
└──┬───┘ │ └────┬─────┘
   │     │      │
   └─────┼──────┘
         │
         ▼
┌─────────────────┐
│ BigQuery Lookup │ → Entity search
└────────┬────────┘
         │
    Has results?
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────────┐
│ Data │  │ NOT FOUND│
│Format│  │ + Links  │
└──┬───┘  └────┬─────┘
   │           │
   └─────┬─────┘
         │
         ▼
┌─────────────────┐
│ Slack Delivery  │
└─────────────────┘
```

---

## n8n Workflow Nodes

| Node | Purpose |
|------|---------|
| Webhook_Events | Receives @mentions and DMs |
| Webhook_Slash | Receives /trend commands |
| Query_Classifier | Pattern matching + entity extraction |
| Needs_LLM | Routes low-confidence to Gemini |
| Gemini_Parse | LLM fallback for entity extraction |
| BQ_Query_Builder | Builds appropriate BigQuery |
| BigQuery_Execute | Runs query |
| Response_Formatter | 7 template types + NOT FOUND |
| Slack Delivery | Post to channel/thread |

---

## Key Design Decisions

### 1. Always respond with structure
Users expect GPT-like answers. Every response follows a template — never "I don't understand."

### 2. NOT FOUND is helpful, not a dead end
When we don't have data:
- Acknowledge the gap
- Explain why (too new, niche, different spelling)
- Provide external resource links
- Offer to track it (👀 reaction)

### 3. LLM only for parsing, not generation
Gemini helps extract entity names from messy queries, but doesn't generate the response. Responses come from templates filled with BigQuery data.

### 4. Opinions are data-driven
"What do you think?" gets a recommendation based on score + gap + catalog coverage, not hallucinated opinions.

### 5. Know your limits
NEWS queries get honest "can't do this" with helpful redirects instead of fake answers.

---

## Files

| File | Purpose |
|------|---------|
| `01_query_classifier.js` | Full query classification logic |
| `02_bigquery_lookup.js` | Query builders for each type |
| `03_response_formatter.js` | All 7 response templates |
| `04_slack_delivery.js` | Delivery method selection |
| `05_llm_fallback.js` | Gemini prompt for entity extraction |
| `06_llm_merger.js` | Merge LLM results back |
| `trend_tool_chatbot_v2.json` | Complete n8n workflow |

---

## Deployment Checklist

- [ ] Import workflow to n8n
- [ ] Configure BigQuery credentials
- [ ] Configure Slack Bot token
- [ ] Configure Gemini API key
- [ ] Set webhook URLs in Slack app
- [ ] Enable Event Subscriptions (app_mention, message.im)
- [ ] Add /trend slash command
- [ ] Test with example queries from this doc
