# Analytics & Data Overview

*Last Updated: December 2024*
*Domain: analytics*

## Overview

Displate's analytics infrastructure covers web analytics (GA4), transaction data, performance marketing metrics, and subscription (Displate Club) analytics. The analytics team serves C-level executives, product managers, team leads, and financial teams.

## Analytics Stack

### Google Analytics 4
- **Migration**: Transitioned from Universal Analytics to GA4
- **Impact**: Historical data comparison limited due to different data models
- **Implementation**: Server-side Google Tag Manager (improved data quality, better privacy compliance)

### Key Data Domains

| Domain | Description | Primary Users |
|--------|-------------|---------------|
| Basic GA4 Data | Sessions, traffic sources, user behavior | All teams |
| Transaction Data | Sales, products, revenue, AOV | Finance, Product, Marketing |
| Performance Marketing | Campaign performance, ROAS, attribution | Marketing, Finance |
| Displate Club Data | Subscription metrics, retention, LTV | Product, Finance |

## Important Caveats

### UA to GA4 Migration
- Historical comparisons before migration require careful handling
- Some metrics calculated differently (sessions, users, engagement)
- Server-side GTM changed data collection methodology

### Cookie Consent Impact
- Opt-out rates vary by region (higher in EU due to GDPR)
- Affects session-based metrics and attribution tracking
- Some traffic becomes unattributable depending on consent rates

### Attribution
- [NEEDS INFO: Current attribution model and lookback window]
- UTM parameters required for all campaigns
- Cross-platform tracking via [NEEDS INFO: specific tools]

## Key Metrics

[NEEDS INFO: Detailed metric definitions - to be extracted from project files]

### Likely Core Metrics
- Sessions / Users (GA4 definitions)
- Conversion Rate
- Average Order Value (AOV)
- Revenue
- Displate Club acquisition/retention rates
- No Results Rate (search quality metric for campaigns)

## Reporting Structure

- **BI Tool**: [NEEDS INFO: Primary BI platform]
- **Dashboard Access**: Managers and above for standard reports
- **Report Refresh**: [NEEDS INFO: Frequency]

## Analytics Team

| Role | Name | Responsibility |
|------|------|----------------|
| Head of Analytics | Mateusz Waligórski (former) | Strategy, stakeholder management |
| BI Specialist | Leszek Żbikowski | Reporting, dashboards |
| Junior BI Specialist | Mariia Kogel | Report generation, data support |
| Senior Analytics Implementation | Michał Bielacki | GTM, tracking implementation |
| Lead Analytics Engineer | Patryk Buczyński | Data infrastructure |

## Related Topics

- `/technical/gtm-setup.md` - Server-side GTM implementation details
- `/business/kpis.md` - Business-level KPI definitions
- `/marketing/attribution.md` - Marketing attribution model

## Knowledge Gaps

- [NEEDS INFO: Complete metric definitions and calculations]
- [NEEDS INFO: Dashboard inventory and access levels]
- [NEEDS INFO: Data retention policies]
- [NEEDS INFO: Attribution model specifics]
