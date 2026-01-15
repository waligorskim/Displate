// ============================================
// CHATBOT V2 - BigQuery Data Lookup
// ============================================
// This node prepares queries for BigQuery based on query type and entities
// Run after query_classifier

const input = $input.first().json;

const {
  query_type,
  entities,
  primary_entity,
  secondary_entity,
  region,
  category
} = input;

// ============================================
// QUERY BUILDERS BY TYPE
// ============================================

function buildDeepDiveQuery(entityName) {
  // Look up single entity with full details
  return `
    WITH trend_data AS (
      SELECT 
        t.trend_name,
        t.trend_score,
        t.category,
        t.freshness_state,
        t.first_seen_date,
        t.last_seen_date,
        DATE_DIFF(CURRENT_DATE(), t.first_seen_date, DAY) as trend_age_days,
        e.ip_name,
        e.characters,
        e.themes,
        e.licensable,
        e.ai_summary,
        e.recommended_action,
        s.internal_search_volume,
        s.catalog_match_count,
        s.gap_assessment
      FROM \`analytics-324613.ttool.trends\` t
      LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
      LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
      WHERE 
        LOWER(t.trend_name) LIKE LOWER('%${entityName}%')
        OR LOWER(e.ip_name) LIKE LOWER('%${entityName}%')
        OR LOWER(ARRAY_TO_STRING(e.characters, ',')) LIKE LOWER('%${entityName}%')
      ORDER BY t.trend_score DESC
      LIMIT 5
    )
    SELECT * FROM trend_data
  `;
}

function buildComparisonQuery(entity1, entity2) {
  // Compare two entities side by side
  return `
    WITH entity_metrics AS (
      SELECT 
        CASE 
          WHEN LOWER(t.trend_name) LIKE LOWER('%${entity1}%') OR LOWER(e.ip_name) LIKE LOWER('%${entity1}%') THEN '${entity1}'
          WHEN LOWER(t.trend_name) LIKE LOWER('%${entity2}%') OR LOWER(e.ip_name) LIKE LOWER('%${entity2}%') THEN '${entity2}'
        END as entity_match,
        t.trend_name,
        t.trend_score,
        t.category,
        t.freshness_state,
        s.internal_search_volume,
        s.catalog_match_count,
        s.gap_assessment,
        e.licensable
      FROM \`analytics-324613.ttool.trends\` t
      LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
      LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
      WHERE 
        LOWER(t.trend_name) LIKE LOWER('%${entity1}%')
        OR LOWER(e.ip_name) LIKE LOWER('%${entity1}%')
        OR LOWER(t.trend_name) LIKE LOWER('%${entity2}%')
        OR LOWER(e.ip_name) LIKE LOWER('%${entity2}%')
    )
    SELECT 
      entity_match,
      MAX(trend_score) as trend_score,
      MAX(internal_search_volume) as internal_search_volume,
      MAX(catalog_match_count) as catalog_coverage,
      STRING_AGG(DISTINCT gap_assessment) as gap_assessment,
      STRING_AGG(DISTINCT freshness_state) as freshness_state,
      STRING_AGG(DISTINCT licensable) as licensable
    FROM entity_metrics
    WHERE entity_match IS NOT NULL
    GROUP BY entity_match
  `;
}

function buildSizingQuery(entityName) {
  // Get sizing metrics for fandom estimation
  return `
    SELECT 
      t.trend_name,
      t.trend_score,
      t.category,
      s.internal_search_volume,
      s.catalog_match_count,
      e.ai_summary,
      -- Comparable benchmarks
      (SELECT AVG(trend_score) FROM \`analytics-324613.ttool.trends\` WHERE category = t.category) as category_avg_score,
      (SELECT AVG(internal_search_volume) FROM \`analytics-324613.ttool.trend_search_gaps\` sg 
       JOIN \`analytics-324613.ttool.trends\` t2 ON sg.trend_id = t2.trend_id 
       WHERE t2.category = t.category) as category_avg_searches
    FROM \`analytics-324613.ttool.trends\` t
    LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
    LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
    WHERE 
      LOWER(t.trend_name) LIKE LOWER('%${entityName}%')
      OR LOWER(e.ip_name) LIKE LOWER('%${entityName}%')
    ORDER BY t.trend_score DESC
    LIMIT 1
  `;
}

function buildSearchQuery(entityName) {
  // Simple search across all data
  return `
    SELECT 
      t.trend_name,
      t.trend_score,
      t.category,
      t.freshness_state,
      e.ip_name,
      s.gap_assessment
    FROM \`analytics-324613.ttool.trends\` t
    LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
    LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
    WHERE 
      LOWER(t.trend_name) LIKE LOWER('%${entityName}%')
      OR LOWER(e.ip_name) LIKE LOWER('%${entityName}%')
      OR LOWER(ARRAY_TO_STRING(e.characters, ',')) LIKE LOWER('%${entityName}%')
      OR LOWER(ARRAY_TO_STRING(e.themes, ',')) LIKE LOWER('%${entityName}%')
    ORDER BY t.trend_score DESC
    LIMIT 10
  `;
}

function buildCalendarQuery(categoryFilter) {
  // Upcoming/hot trends - relies on freshness_state = 'RISING' or 'NEW'
  const categoryClause = categoryFilter ? `AND t.category = '${categoryFilter}'` : '';
  return `
    SELECT 
      t.trend_name,
      t.trend_score,
      t.category,
      t.freshness_state,
      t.first_seen_date,
      e.ip_name,
      e.ai_summary,
      s.catalog_match_count,
      s.gap_assessment
    FROM \`analytics-324613.ttool.trends\` t
    LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
    LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
    WHERE 
      t.freshness_state IN ('NEW', 'RISING')
      ${categoryClause}
    ORDER BY t.trend_score DESC
    LIMIT 10
  `;
}

function buildRegionalQuery(regionCode, categoryFilter) {
  // Regional trends - assumes we have region column
  const categoryClause = categoryFilter ? `AND t.category = '${categoryFilter}'` : '';
  return `
    SELECT 
      t.trend_name,
      t.trend_score,
      t.category,
      t.region,
      e.ip_name,
      s.gap_assessment
    FROM \`analytics-324613.ttool.trends\` t
    LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
    LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
    WHERE 
      t.region = '${regionCode}'
      ${categoryClause}
    ORDER BY t.trend_score DESC
    LIMIT 10
  `;
}

function buildOpinionQuery(entityName) {
  // Same as deep dive but we'll format response differently
  return buildDeepDiveQuery(entityName);
}

function buildTopTrendsQuery(categoryFilter, limit = 10) {
  // Hot trends for general queries
  const categoryClause = categoryFilter ? `WHERE t.category = '${categoryFilter}'` : '';
  return `
    SELECT 
      t.trend_name,
      t.trend_score,
      t.category,
      t.freshness_state,
      e.ip_name,
      s.internal_search_volume,
      s.catalog_match_count,
      s.gap_assessment
    FROM \`analytics-324613.ttool.trends\` t
    LEFT JOIN \`analytics-324613.ttool.trend_enrichment\` e ON t.trend_id = e.trend_id
    LEFT JOIN \`analytics-324613.ttool.trend_search_gaps\` s ON t.trend_id = s.trend_id
    ${categoryClause}
    ORDER BY t.trend_score DESC
    LIMIT ${limit}
  `;
}

// ============================================
// SELECT QUERY BASED ON TYPE
// ============================================

let query = '';
let queryDescription = '';

switch (query_type) {
  case 'DEEP_DIVE':
    if (primary_entity) {
      query = buildDeepDiveQuery(primary_entity);
      queryDescription = `Deep dive lookup for: ${primary_entity}`;
    } else {
      query = buildTopTrendsQuery(category, 5);
      queryDescription = 'Top trends (no entity specified)';
    }
    break;
    
  case 'COMPARISON':
    if (primary_entity && secondary_entity) {
      query = buildComparisonQuery(primary_entity, secondary_entity);
      queryDescription = `Comparing: ${primary_entity} vs ${secondary_entity}`;
    } else if (primary_entity) {
      query = buildDeepDiveQuery(primary_entity);
      queryDescription = `Single entity lookup (comparison needs 2): ${primary_entity}`;
    }
    break;
    
  case 'SIZING':
    if (primary_entity) {
      query = buildSizingQuery(primary_entity);
      queryDescription = `Fandom sizing for: ${primary_entity}`;
    }
    break;
    
  case 'SEARCH':
    if (primary_entity) {
      query = buildSearchQuery(primary_entity);
      queryDescription = `Search for: ${primary_entity}`;
    }
    break;
    
  case 'CALENDAR':
    query = buildCalendarQuery(category);
    queryDescription = `Upcoming/rising trends${category ? ` in ${category}` : ''}`;
    break;
    
  case 'REGIONAL':
    if (region) {
      query = buildRegionalQuery(region, category);
      queryDescription = `Regional trends for: ${region}`;
    } else {
      query = buildTopTrendsQuery(category);
      queryDescription = 'Top trends (no region specified)';
    }
    break;
    
  case 'OPINION':
    if (primary_entity) {
      query = buildOpinionQuery(primary_entity);
      queryDescription = `Opinion/recommendation for: ${primary_entity}`;
    }
    break;
    
  case 'NEWS':
    // News queries can't be answered from our database
    query = null;
    queryDescription = 'News query - no database lookup needed';
    break;
    
  default:
    query = buildTopTrendsQuery(category, 5);
    queryDescription = 'Fallback to top trends';
}

// ============================================
// OUTPUT
// ============================================

return [{
  json: {
    ...input,
    bigquery_query: query,
    query_description: queryDescription,
    needs_lookup: query !== null
  }
}];
