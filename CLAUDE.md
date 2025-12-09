# Displate Knowledge Base - Claude Code Instructions

You are working with a knowledge repository for **Displate**, a metal poster marketplace company. This repo serves as the foundational context for any AI-assisted work related to Displate.

## Company Context

**Displate** is a Polish e-commerce company selling metal posters globally. Key facts:
- **Product**: Metal posters with magnetic mounting system (no drilling required)
- **Model**: Marketplace + in-house designs + licensed IPs (Disney, Marvel, Bethesda, etc.)
- **Subscription**: "Displate Club" - membership program for collectors
- **Audience**: Gaming, anime, movies, pop culture enthusiasts (primarily 18-35 male)
- **Scale**: Global D2C, significant US/EU presence

## Repository Structure

```
/product/          - Product catalog, features, sizes, pricing, production
/analytics/        - Metrics definitions, data sources, GA4, reporting
/marketing/        - Brand voice, campaigns, channels, content strategy
/operations/       - Workflows, fulfillment, shipping, tools, team structure
/customer-support/ - Policies, common issues, escalation, returns
/technical/        - Platform architecture, integrations, APIs, GTM setup
/business/         - KPIs, strategy, OKRs, competitive landscape
/diagrams/         - Process flows, architecture diagrams, visual assets
```

## How to Use This Knowledge

### When answering questions about Displate:
1. Check relevant domain folder first
2. Cross-reference related domains (e.g., analytics + marketing for campaign performance)
3. Note any `[NEEDS INFO]` tags - these indicate gaps in documentation
4. Flag time-sensitive info (metrics, strategies may change)

### When creating Displate-related content:
- Use conversational but clear tone
- Reference specific metrics and processes from this repo
- Maintain consistency with existing terminology
- Flag if something contradicts documented information

## Key Terminology

| Term | Definition |
|------|------------|
| **LE / Limited Edition** | Time-limited or quantity-limited designs, higher price point |
| **Displate Club** | Subscription membership with discounts and exclusive access |
| **Artist Marketplace** | Platform for independent artists to sell designs |
| **Licensed IP** | Officially licensed content (Disney, Marvel, gaming franchises) |
| **GA4** | Google Analytics 4 - current analytics platform |
| **Server-side GTM** | Google Tag Manager running server-side for better data collection |
| **Buy Box** | Amazon listing ownership (relevant for Amazon channel) |

## Important Caveats

### Analytics Context
- Migrated from Universal Analytics to GA4 (historical comparisons limited)
- Server-side GTM implementation affects tracking methodology
- Cookie consent impacts data completeness (opt-out rates vary by region)

### Business Context
- Art marketplace model differs from traditional e-commerce
- Hybrid subscription + one-time purchase model
- Artist community is key stakeholder alongside customers
- Seasonal patterns tied to gaming releases, pop culture events

## Contact & Ownership

- **Knowledge Base Owner**: Mateusz Waligóra (freelance consultant, former Head of Analytics)
- **Last Updated**: December 2024
- **Status**: Living document - update as company evolves

## File Conventions

- All docs in Markdown format
- Use `[NEEDS INFO: topic]` for documented knowledge gaps
- Use `[CONFIDENTIAL]` tag for sensitive internal information
- Use `[TIME-SENSITIVE: date]` for info that expires or needs verification
- Include "Last Updated" date in each file header
