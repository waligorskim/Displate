// ============================================
// CHATBOT V2 - Query Classifier & Entity Extractor
// ============================================
// Drop this into the first Code node after webhook
// Outputs: query_type, entities, confidence, original_text

const input = $input.first().json;

// Extract text from various Slack input formats
let rawText = '';
let userId = '';
let channelId = '';
let threadTs = null;
let responseUrl = null;

if (input.event) {
  // App mention or DM
  rawText = (input.event.text || '').replace(/<@[A-Z0-9]+>/g, '').trim();
  userId = input.event.user;
  channelId = input.event.channel;
  threadTs = input.event.ts;
} else if (input.text !== undefined) {
  // Slash command
  rawText = input.text || '';
  userId = input.user_id;
  channelId = input.channel_id;
  responseUrl = input.response_url;
}

const text = rawText.trim();
const lower = text.toLowerCase();

// ============================================
// QUERY TYPE CLASSIFICATION
// ============================================

const queryPatterns = [
  {
    type: 'COMPARISON',
    patterns: [
      /\b(compare|vs\.?|versus|or)\b.*\b(vs\.?|or|versus)\b/i,
      /should we.*(or|vs)/i,
      /which.*(better|pick|choose|invest)/i,
      /\bvs\.?\b/i,
      /(warframe|pokemon|star wars).*(or|vs).*(crusader|zelda|trek)/i
    ],
    confidence: 0.9
  },
  {
    type: 'SIZING',
    patterns: [
      /how (big|large|popular|huge)/i,
      /fandom size/i,
      /market size/i,
      /how many (fans|people|searches)/i,
      /size of.*(fandom|community|audience)/i
    ],
    confidence: 0.9
  },
  {
    type: 'CALENDAR',
    patterns: [
      /upcoming|coming (soon|out|up)/i,
      /release (date|schedule|calendar)/i,
      /when.*(release|launch|come out)/i,
      /new (releases|titles|games|movies)/i,
      /\b(2025|2026|next year|next month|Q[1-4])\b.*\b(release|launch)/i
    ],
    confidence: 0.85
  },
  {
    type: 'OPINION',
    patterns: [
      /what do you think/i,
      /should (we|i) (invest|focus|prioritize)/i,
      /worth (it|investing|pursuing)/i,
      /recommend/i,
      /your (take|opinion|thoughts)/i,
      /good (opportunity|idea|investment)/i
    ],
    confidence: 0.85
  },
  {
    type: 'SEARCH',
    patterns: [
      /any mention/i,
      /search for/i,
      /find.*(trend|mention)/i,
      /do we have/i,
      /is there.*(data|info|trend)/i,
      /look up/i
    ],
    confidence: 0.9
  },
  {
    type: 'NEWS',
    patterns: [
      /\b(free|deal|sale|discount)\b/i,
      /epic (store|games)/i,
      /steam sale/i,
      /(announce|announced|announcement)/i,
      /did.*(detect|see|notice|catch)/i,
      /news about/i,
      /latest on/i
    ],
    confidence: 0.8
  },
  {
    type: 'REGIONAL',
    patterns: [
      /\bin (DE|UK|US|FR|PL|EU|Germany|France|Poland|America|Europe)\b/i,
      /top.*(in|for) \w{2,}/i,
      /(german|french|polish|american|european) (market|trend)/i,
      /this week in/i
    ],
    confidence: 0.85
  },
  {
    type: 'DEEP_DIVE',
    patterns: [
      /tell me (about|more)/i,
      /what (is|about|are)/i,
      /more (about|on|info)/i,
      /explain/i,
      /breakdown/i,
      /details (on|about)/i
    ],
    confidence: 0.8
  }
];

// Classify query
let queryType = 'DEEP_DIVE'; // Default
let confidence = 0.5;
let matchedPattern = null;

for (const category of queryPatterns) {
  for (const pattern of category.patterns) {
    if (pattern.test(lower)) {
      if (category.confidence > confidence) {
        queryType = category.type;
        confidence = category.confidence;
        matchedPattern = pattern.toString();
      }
      break;
    }
  }
}

// ============================================
// ENTITY EXTRACTION
// ============================================

// Common noise words to filter out
const stopWords = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'about', 'more', 'tell', 'me',
  'what', 'how', 'why', 'when', 'where', 'which', 'who', 'think', 'you',
  'your', 'opinion', 'take', 'thoughts', 'of', 'on', 'in', 'to', 'for',
  'with', 'that', 'this', 'it', 'its', 'any', 'some', 'trend', 'trends',
  'trending', 'big', 'size', 'fandom', 'game', 'games', 'movie', 'movies',
  'show', 'shows', 'series', 'anime', 'upcoming', 'release', 'mention',
  'mentions', 'search', 'find', 'look', 'up', 'we', 'should', 'invest',
  'worth', 'good', 'bad', 'best', 'top', 'popular', 'and', 'or', 'vs'
]);

// Extract potential entity names
function extractEntities(text) {
  const entities = [];
  
  // Pattern 1: Quoted strings
  const quotedMatches = text.match(/["']([^"']+)["']/g);
  if (quotedMatches) {
    quotedMatches.forEach(m => {
      entities.push({
        name: m.replace(/["']/g, '').trim(),
        confidence: 0.95,
        source: 'quoted'
      });
    });
  }
  
  // Pattern 2: Known title patterns (Title Case sequences)
  const titleCasePattern = /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*(?:\s+\d+)?)\b/g;
  let match;
  while ((match = titleCasePattern.exec(rawText)) !== null) {
    const candidate = match[1].trim();
    if (candidate.length > 2 && !stopWords.has(candidate.toLowerCase())) {
      entities.push({
        name: candidate,
        confidence: 0.7,
        source: 'title_case'
      });
    }
  }
  
  // Pattern 3: After "about", "on", common prepositions
  const aboutPattern = /(?:about|on|for|called|named|titled)\s+([A-Za-z0-9][\w\s:'-]{2,30}?)(?:\?|$|,|\.|!)/gi;
  while ((match = aboutPattern.exec(text)) !== null) {
    const candidate = match[1].trim();
    const words = candidate.split(/\s+/);
    const filtered = words.filter(w => !stopWords.has(w.toLowerCase())).join(' ');
    if (filtered.length > 2) {
      entities.push({
        name: filtered,
        confidence: 0.75,
        source: 'preposition'
      });
    }
  }
  
  // Pattern 4: For comparison queries, extract both sides
  if (queryType === 'COMPARISON') {
    const vsPattern = /(.+?)\s+(?:vs\.?|or|versus)\s+(.+?)(?:\?|$)/i;
    const vsMatch = lower.match(vsPattern);
    if (vsMatch) {
      [vsMatch[1], vsMatch[2]].forEach(side => {
        const cleaned = side.replace(/should we invest in|fandom|which is better/gi, '').trim();
        if (cleaned.length > 2) {
          entities.push({
            name: cleaned,
            confidence: 0.85,
            source: 'comparison'
          });
        }
      });
    }
  }
  
  // Deduplicate and sort by confidence
  const seen = new Set();
  return entities
    .filter(e => {
      const key = e.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3); // Max 3 entities
}

const entities = extractEntities(text);

// ============================================
// EXTRACT REGION (for REGIONAL queries)
// ============================================

const regionMap = {
  'de': 'DE', 'germany': 'DE', 'german': 'DE',
  'uk': 'GB', 'britain': 'GB', 'british': 'GB', 'england': 'GB',
  'us': 'US', 'usa': 'US', 'america': 'US', 'american': 'US',
  'fr': 'FR', 'france': 'FR', 'french': 'FR',
  'pl': 'PL', 'poland': 'PL', 'polish': 'PL',
  'eu': 'EU', 'europe': 'EU', 'european': 'EU'
};

let region = null;
for (const [key, code] of Object.entries(regionMap)) {
  if (lower.includes(key)) {
    region = code;
    break;
  }
}

// ============================================
// EXTRACT CATEGORY FILTER
// ============================================

const categoryMap = {
  'gaming': 'GAMES', 'games': 'GAMES', 'game': 'GAMES', 'video game': 'GAMES',
  'anime': 'MANGA_ANIME', 'manga': 'MANGA_ANIME',
  'movie': 'MOVIES', 'movies': 'MOVIES', 'film': 'MOVIES', 'films': 'MOVIES',
  'tv': 'TV_SERIES', 'series': 'TV_SERIES', 'show': 'TV_SERIES', 'shows': 'TV_SERIES'
};

let category = null;
for (const [key, cat] of Object.entries(categoryMap)) {
  if (lower.includes(key)) {
    category = cat;
    break;
  }
}

// ============================================
// OUTPUT
// ============================================

return [{
  json: {
    // Query classification
    query_type: queryType,
    confidence: confidence,
    matched_pattern: matchedPattern,
    
    // Extracted info
    entities: entities,
    primary_entity: entities[0]?.name || null,
    secondary_entity: entities[1]?.name || null,
    region: region,
    category: category,
    
    // Original context
    original_text: text,
    user_id: userId,
    channel_id: channelId,
    thread_ts: threadTs,
    response_url: responseUrl
  }
}];
