# Contributing to Displate Knowledge Base

## How to Add Knowledge

### Option 1: Use the Extraction Prompt

Copy this prompt into Claude, ChatGPT, or another AI assistant along with your source documents:

---

```
You are a knowledge extraction specialist building Displate's company knowledge repository. This will be used by AI systems to understand Displate and answer questions accurately.

## Your Task
Convert the provided documents into well-structured markdown that captures all essential knowledge about [SPECIFY DOMAIN: product, analytics, marketing, operations, customer support, technical, or business].

## Extraction Process

1. **Read and understand** all provided documents

2. **Extract key information** including:
   - Core concepts and definitions
   - Processes and workflows (step-by-step when relevant)
   - Important metrics, KPIs, or data points
   - Tools and systems used
   - Common questions and their answers
   - Context that AI would need to give accurate answers

3. **Structure for AI consumption**:
   - Define all acronyms and jargon
   - Include concrete examples
   - Add numerical context (sizes, scales, frequencies)
   - Note what's time-sensitive vs stable
   - Flag confidential items with [CONFIDENTIAL]
   - Mark gaps with [NEEDS INFO: topic]

## Output Format

Use this template:

---
# [Topic Name]

*Last Updated: [DATE]*
*Domain: [product/analytics/marketing/operations/customer-support/technical/business]*

## Overview
[2-3 sentence summary of what this document covers]

## [Main Section 1]
[Content organized logically]

## [Main Section 2]
[Content organized logically]

## Key Metrics
[If applicable - metrics with definitions]

## Related Topics
[Links to other relevant docs in the repo]

## Knowledge Gaps
[List anything unclear or missing with [NEEDS INFO: topic] tags]
---

## Quality Standards

- **Conversational but clear** - Write like explaining to a smart colleague
- **Complete sentences** - No shorthand requiring interpretation
- **Active voice** - "The system processes orders" not "Orders are processed"
- **Specific over vague** - "Updates every 24 hours" not "updates regularly"
- **Examples included** - Show, don't just tell

## Start
Process the provided documents now. Ask clarifying questions if the domain is unclear.
```

---

### Option 2: Manual Documentation

Write markdown files directly following these conventions:

1. Use the template structure above
2. Place in appropriate domain folder
3. Include "Last Updated" date
4. Use standard tagging: `[CONFIDENTIAL]`, `[NEEDS INFO]`, `[TIME-SENSITIVE]`

## File Naming

- Use lowercase with hyphens: `metrics-definitions.md`
- Be descriptive: `ga4-implementation-guide.md` not `analytics.md`
- Group related topics: `customer-journey-acquisition.md`, `customer-journey-checkout.md`

## Review Process

1. Create/update file in appropriate folder
2. Ensure all acronyms are defined
3. Check for sensitive information tagging
4. Commit with descriptive message

## Questions?

Contact: Mateusz Waligóra (repo owner)
