# Trend Intelligence Tool - Executive Summary

> For: Leadership, BizDev, Marketplace Teams
> Last Updated: December 17, 2024

---

## What Is This?

A weekly intelligence report that tells you **what's trending** in gaming, movies, TV, and anime — and whether Displate is positioned to capitalize on it.

**Think of it as:** A radar that spots opportunities before competitors, delivered every Tuesday to Slack.

---

## The Problem It Solves

Today, identifying trending content is manual and reactive:
- BizDev hears about a hot IP after competitors already have products
- Marketplace doesn't know which artist uploads to prioritize
- Nobody knows if existing inventory matches what customers are searching for

**Result:** Missed revenue, slow licensing decisions, content gaps.

---

## How It Works

```
Google sees            We check if           You get a report
"Blue Lock" is    →    we have products  →   saying "Blue Lock
trending                for "Blue Lock"       is HOT, we have 5
                                              artworks, no license"
```

### Step-by-Step:

1. **Monitor** — Pull trending topics from Google Trends (games, movies, TV, anime)
2. **Enrich** — AI extracts IP names, characters, themes
3. **Check Inventory** — How many artworks do we have? Any pending validation?
4. **Check Demand** — Are customers searching for this on Displate?
5. **Check Coverage** — Do we have a license/brandshop?
6. **Score** — Is this a gap (opportunity) or are we covered?
7. **Report** — Weekly Slack message with actionable buttons

---

## What You'll See

Every Tuesday at 11:00 AM UTC in Slack:

```
🎌 ANIME | Blue Lock Season 2
━━━━━━━━━━━━━━━━━━━━━━━━

📈 Google Trends: 92 (+340% this week)
🔍 Displate searches: 3,100 in last 30 days
📦 Artworks: 5 live | 45 pending validation
❌ No license

⏱️ Trending for: 3 days
🎯 Status: HIGH OPPORTUNITY 🔥

[I'm on it] [Reach out] [Not for us] [Snooze]
```

### What Each Section Means:

| Section | What It Tells You |
|---------|-------------------|
| 📈 Google Trends | How hot is this externally? |
| 🔍 Displate searches | Are OUR customers looking for it? |
| 📦 Artworks | Do we have supply to meet demand? |
| License status | Can we officially sell this? |
| Gap status | **Should we act?** |

### Gap Statuses:

| Status | Meaning | Action |
|--------|---------|--------|
| 🔥 HIGH OPPORTUNITY | High demand, low supply, no license | Prioritize licensing outreach |
| 📈 EXPAND INVENTORY | Licensed, but need more artworks | Push to artists, expedite validation |
| 👁️ MONITOR | Trending externally, low internal demand | Watch for now |
| ✅ WELL COVERED | Good inventory + license | No action needed |
| ⏸️ LOW PRIORITY | Weak signals | Ignore |

---

## The Buttons

Click directly in Slack to take action:

| Button | What It Does |
|--------|--------------|
| **I'm on it** | Claims the trend — others see you're handling it |
| **Reach out** | Flags for licensing/partnership outreach |
| **Not for us** | Dismisses (with reason) — won't show again |
| **Snooze 7d** | Hides for a week — resurfaces if still trending |

All clicks are logged. We track who acted, when, and what happened.

---

## Categories Covered

| Category | Examples |
|----------|----------|
| 🎮 Games | Elden Ring, Baldur's Gate, Genshin Impact |
| 🎬 Movies | Dune, Marvel releases, Star Wars |
| 📺 TV Series | House of the Dragon, The Last of Us |
| 🎌 Anime & Manga | Blue Lock, Jujutsu Kaisen, One Piece |

**Not covered:** Sports, news, politics (too noisy, low merchandising fit)

---

## Bonus: Chatbot

Can't wait until Tuesday? Ask the bot:

- `@TrendBot what's trending in anime this week?`
- `@TrendBot do we have products for Warhammer 40K?`
- `/trends today` — Get today's snapshot
- `/trends research "Elden Ring"` — Deep dive on specific IP

---

## Timeline

| Phase | Target | What's Delivered |
|-------|--------|------------------|
| ✅ Phase 1 | Done | Basic weekly report (current state) |
| 🚧 Phase 2 | Jan 2025 | Demand-supply gap analysis, all 4 categories |
| 🚧 Phase 3 | Feb 2025 | Interactive buttons, action tracking |
| 🚧 Phase 4 | Mar 2025 | Enhanced chatbot with slash commands |

---

## Who Owns This?

| Area | Owner |
|------|-------|
| Overall system | Mateusz Waligóra |
| Data pipeline (Google Trends → BigQuery) | Bartosz Klocek |
| Licensing decisions | BizDev team |
| Content prioritization | Marketplace team |

---

## Questions?

Reach out to Mateusz Waligóra or drop a message in `#trend-intelligence`.
