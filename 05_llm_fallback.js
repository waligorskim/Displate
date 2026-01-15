// ============================================
// CHATBOT V2 - LLM Fallback Handler
// ============================================
// Used when:
// 1. Query confidence is low (< 0.6)
// 2. No entity extracted but query needs one
// 3. Need to disambiguate similar titles
//
// This runs BEFORE BigQuery lookup if conditions met

const input = $input.first().json;

const {
  query_type,
  confidence,
  entities,
  primary_entity,
  original_text
} = input;

// ============================================
// DECIDE IF LLM FALLBACK NEEDED
// ============================================

const needsLLM = 
  (confidence < 0.6) ||
  (!primary_entity && ['DEEP_DIVE', 'OPINION', 'SIZING', 'SEARCH', 'COMPARISON'].includes(query_type)) ||
  (query_type === 'COMPARISON' && entities.length < 2);

if (!needsLLM) {
  // Pass through unchanged
  return [{ json: { ...input, llm_used: false } }];
}

// ============================================
// BUILD LLM PROMPT
// ============================================

const systemPrompt = `You are a query parser for a trend intelligence tool at Displate (metal poster company). 
Your job is to extract structured information from user queries about entertainment IPs (games, movies, anime, TV shows).

RESPOND ONLY WITH VALID JSON, no markdown, no explanation.`;

const userPrompt = `Parse this query: "${original_text}"

Extract:
1. query_type: One of DEEP_DIVE, COMPARISON, SIZING, SEARCH, CALENDAR, REGIONAL, OPINION, NEWS
2. entities: Array of entertainment IP/title names mentioned (max 3)
3. category: GAMES, MOVIES, TV_SERIES, MANGA_ANIME, or null
4. region: Country code (US, DE, UK, FR, PL, EU) or null
5. confidence: Your confidence 0-1 in this parsing

Examples:
- "what about Path of Exile 2" → {"query_type":"DEEP_DIVE","entities":["Path of Exile 2"],"category":"GAMES","region":null,"confidence":0.95}
- "Warframe vs Crusader Kings" → {"query_type":"COMPARISON","entities":["Warframe","Crusader Kings"],"category":"GAMES","region":null,"confidence":0.9}
- "how big is Clair Obscur fandom" → {"query_type":"SIZING","entities":["Clair Obscur: Expedition 33"],"category":"GAMES","region":null,"confidence":0.85}
- "any free epic store games" → {"query_type":"NEWS","entities":[],"category":"GAMES","region":null,"confidence":0.8}

Important: 
- Expand abbreviated titles to full names when confident (e.g., "PoE2" → "Path of Exile 2")
- For comparison, extract BOTH entities
- If query is about news/deals/free games, use NEWS type
- If asking "should we invest" or "what do you think", use OPINION type

JSON response:`;

// ============================================
// OUTPUT FOR LLM NODE
// ============================================

return [{
  json: {
    ...input,
    llm_used: true,
    llm_prompt: {
      system: systemPrompt,
      user: userPrompt
    }
  }
}];
