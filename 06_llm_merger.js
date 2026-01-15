// ============================================
// CHATBOT V2 - LLM Response Merger
// ============================================
// Parses LLM JSON response and merges back into main flow

const input = $input.first().json;
const originalData = $('LLM_Fallback_Check').first().json;

// If LLM wasn't used, this won't be called (routed around)
// But just in case:
if (!originalData.llm_used) {
  return [{ json: originalData }];
}

// ============================================
// PARSE LLM RESPONSE
// ============================================

let llmResult;
try {
  // Handle different response formats from Gemini
  const content = input.candidates?.[0]?.content?.parts?.[0]?.text || 
                  input.content || 
                  input.text ||
                  input;
  
  // Clean up response (remove markdown if present)
  let jsonStr = typeof content === 'string' ? content : JSON.stringify(content);
  jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  llmResult = JSON.parse(jsonStr);
} catch (e) {
  // Failed to parse - fall back to original
  console.log('LLM parse failed:', e.message);
  return [{ json: { ...originalData, llm_parse_failed: true } }];
}

// ============================================
// MERGE LLM RESULTS WITH ORIGINAL
// ============================================

// Only override if LLM has higher confidence
const useQueryType = llmResult.confidence > originalData.confidence;

const merged = {
  ...originalData,
  
  // Override query type if LLM more confident
  query_type: useQueryType ? llmResult.query_type : originalData.query_type,
  confidence: Math.max(llmResult.confidence || 0, originalData.confidence),
  
  // Merge entities (LLM might have found better ones)
  entities: llmResult.entities?.length > 0 
    ? llmResult.entities.map((e, i) => ({
        name: e,
        confidence: llmResult.confidence || 0.8,
        source: 'llm'
      }))
    : originalData.entities,
  
  primary_entity: llmResult.entities?.[0] || originalData.primary_entity,
  secondary_entity: llmResult.entities?.[1] || originalData.secondary_entity,
  
  // Merge category/region
  category: llmResult.category || originalData.category,
  region: llmResult.region || originalData.region,
  
  // Tracking
  llm_enhanced: true,
  llm_confidence: llmResult.confidence
};

return [{ json: merged }];
