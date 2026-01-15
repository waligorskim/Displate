// ============================================
// CHATBOT V2 - Response Formatter
// ============================================
// Templates for all query types with fallback handling
// Run after BigQuery results

const input = $input.first().json;
const queryInput = $('Query_Classifier').first().json;

const {
  query_type,
  primary_entity,
  secondary_entity,
  region,
  category,
  original_text,
  user_id,
  channel_id,
  thread_ts,
  response_url
} = queryInput;

// BigQuery results (may be empty)
const results = input.results || input || [];
const hasData = Array.isArray(results) ? results.length > 0 : Object.keys(results).length > 0;

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatNumber(num) {
  if (!num) return '—';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getScoreEmoji(score) {
  if (!score) return '⚪';
  if (score >= 80) return '🔥';
  if (score >= 60) return '📈';
  if (score >= 40) return '➡️';
  return '📉';
}

function getGapEmoji(gap) {
  if (!gap) return '⚪';
  const g = gap.toUpperCase();
  if (g.includes('HIGH')) return '🟢';
  if (g.includes('WATCH') || g.includes('MEDIUM')) return '🟡';
  if (g.includes('SATURATED') || g.includes('LOW')) return '🔴';
  return '⚪';
}

function formatCategory(cat) {
  const map = {
    'GAMES': '🎮 Games',
    'MANGA_ANIME': '🎌 Anime/Manga',
    'MOVIES': '🎬 Movies',
    'TV_SERIES': '📺 TV Series'
  };
  return map[cat] || cat || 'Unknown';
}

function escapeSlack(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// External resource links
function getResourceLinks(entityName, category) {
  const encoded = encodeURIComponent(entityName);
  const links = [];
  
  if (!category || category === 'GAMES') {
    links.push(`• 🎮 SteamDB: https://steamdb.info/search/?q=${encoded}`);
  }
  if (!category || category === 'MOVIES' || category === 'TV_SERIES') {
    links.push(`• 🎬 IMDB: https://www.imdb.com/find?q=${encoded}`);
  }
  if (!category || category === 'MANGA_ANIME') {
    links.push(`• 🎌 MyAnimeList: https://myanimelist.net/search/all?q=${encoded}`);
  }
  links.push(`• 📈 Google Trends: https://trends.google.com/trends/explore?q=${encoded}`);
  
  return links.join('\n');
}

// ============================================
// RESPONSE TEMPLATES
// ============================================

function formatDeepDive(data, entityName) {
  if (!data || data.length === 0) {
    return formatNotFound(entityName);
  }
  
  const d = data[0];
  const score = d.trend_score || 0;
  const searches = d.internal_search_volume || 0;
  const catalog = d.catalog_match_count || 0;
  const gap = d.gap_assessment || 'Unknown';
  const freshness = d.freshness_state || 'Unknown';
  const ageText = d.trend_age_days ? `${d.trend_age_days} days` : 'Unknown';
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📊 ${escapeSlack(d.trend_name || entityName)}`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Category:* ${formatCategory(d.category)}\n*IP:* ${escapeSlack(d.ip_name) || 'N/A'}`
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📈 Trend Status*\n• Score: ${score}/100 ${getScoreEmoji(score)}\n• Freshness: ${freshness}\n• First seen: ${ageText} ago`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🎯 Displate Opportunity*\n• Internal searches: ${formatNumber(searches)}/month\n• Catalog designs: ${formatNumber(catalog)}\n• Gap Assessment: ${getGapEmoji(gap)} ${gap}`
        }
      },
      ...(d.ai_summary ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 Context*\n${escapeSlack(d.ai_summary)}`
        }
      }] : []),
      ...(d.recommended_action ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📋 Recommendation*\n${escapeSlack(d.recommended_action)}`
        }
      }] : []),
      { type: "divider" },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Data from Google Trends + Displate internal search. Last updated: ${new Date().toLocaleDateString()}_` }
        ]
      }
    ]
  };
}

function formatComparison(data, entity1, entity2) {
  if (!data || data.length < 2) {
    // Only found one or none
    const found = data && data.length === 1 ? data[0].entity_match : null;
    const missing = found === entity1 ? entity2 : entity1;
    
    if (found) {
      return {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `⚠️ *Partial Comparison*\n\nI found data for *${escapeSlack(found)}* but not for *${escapeSlack(missing)}*.\n\n${getResourceLinks(missing, null)}`
            }
          }
        ]
      };
    }
    return formatNotFound(`${entity1} or ${entity2}`);
  }
  
  // Build comparison table
  const e1 = data.find(d => d.entity_match?.toLowerCase().includes(entity1.toLowerCase())) || data[0];
  const e2 = data.find(d => d.entity_match?.toLowerCase().includes(entity2.toLowerCase())) || data[1];
  
  const winner = (e1.trend_score || 0) > (e2.trend_score || 0) ? entity1 : entity2;
  const gapWinner = e1.gap_assessment?.includes('HIGH') ? entity1 : 
                    e2.gap_assessment?.includes('HIGH') ? entity2 : 'Neither';
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `⚖️ ${escapeSlack(entity1)} vs ${escapeSlack(entity2)}`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `| Metric | ${escapeSlack(entity1)} | ${escapeSlack(entity2)} |
|--------|--------|--------|
| Trend Score | ${e1.trend_score || '—'} ${getScoreEmoji(e1.trend_score)} | ${e2.trend_score || '—'} ${getScoreEmoji(e2.trend_score)} |
| Searches | ${formatNumber(e1.internal_search_volume)} | ${formatNumber(e2.internal_search_volume)} |
| Catalog | ${formatNumber(e1.catalog_coverage)} designs | ${formatNumber(e2.catalog_coverage)} designs |
| Gap | ${getGapEmoji(e1.gap_assessment)} ${e1.gap_assessment || '—'} | ${getGapEmoji(e2.gap_assessment)} ${e2.gap_assessment || '—'} |
| Freshness | ${e1.freshness_state || '—'} | ${e2.freshness_state || '—'} |`
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 My Take*\n• Higher momentum: *${winner}*\n• Better gap opportunity: *${gapWinner}*\n\n_Consider licensing costs, brand fit, and art complexity — not factored in this analysis._`
        }
      }
    ]
  };
}

function formatSizing(data, entityName) {
  if (!data || data.length === 0) {
    return formatNotFound(entityName);
  }
  
  const d = data[0];
  const score = d.trend_score || 0;
  const searches = d.internal_search_volume || 0;
  const avgScore = d.category_avg_score || 50;
  const avgSearches = d.category_avg_searches || 500;
  
  // Size classification
  let sizeLabel = 'Small';
  let sizeEmoji = '🔹';
  if (score >= 70 && searches >= 1000) {
    sizeLabel = 'Large';
    sizeEmoji = '🔷';
  } else if (score >= 50 || searches >= 500) {
    sizeLabel = 'Medium';
    sizeEmoji = '🔶';
  }
  
  // vs category average
  const vsAvgScore = score > avgScore ? 'above' : 'below';
  const vsAvgSearches = searches > avgSearches ? 'above' : 'below';
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📏 ${escapeSlack(d.trend_name || entityName)} — Fandom Size`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Overall Assessment:* ${sizeEmoji} *${sizeLabel} Fandom*`
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📊 Trend Signals*\n• Google Trend Score: ${score}/100 (${vsAvgScore} ${formatCategory(d.category)} avg of ${Math.round(avgScore)})\n• Displate Searches: ${formatNumber(searches)}/month (${vsAvgSearches} category avg of ${formatNumber(avgSearches)})\n• Category: ${formatCategory(d.category)}`
        }
      },
      ...(d.ai_summary ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 Context*\n${escapeSlack(d.ai_summary)}`
        }
      }] : []),
      { type: "divider" },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Fandom size estimated from search volume proxies. Not a precise measure._` }
        ]
      }
    ]
  };
}

function formatSearch(data, searchTerm) {
  if (!data || data.length === 0) {
    return formatNotFound(searchTerm);
  }
  
  const resultLines = data.slice(0, 8).map((d, i) => {
    return `${i + 1}. *${escapeSlack(d.trend_name)}* — ${getScoreEmoji(d.trend_score)} ${d.trend_score || '—'} | ${getGapEmoji(d.gap_assessment)} ${d.gap_assessment || '—'}`;
  }).join('\n');
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🔍 Search Results: "${escapeSlack(searchTerm)}"`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Found ${data.length} matching trend${data.length > 1 ? 's' : ''}:\n\n${resultLines}`
        }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Ask "tell me about [name]" for details on any result._` }
        ]
      }
    ]
  };
}

function formatCalendar(data, categoryFilter) {
  if (!data || data.length === 0) {
    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🗓️ *No Rising Trends Found*\n\nNo NEW or RISING trends in the database${categoryFilter ? ` for ${formatCategory(categoryFilter)}` : ''}.\n\n*Where to check upcoming releases:*\n• 🎮 Steam Upcoming: https://store.steampowered.com/explore/upcoming\n• 📅 IGN Calendar: https://www.ign.com/upcoming/games\n• 🎬 IMDB Calendar: https://www.imdb.com/calendar`
          }
        }
      ]
    };
  }
  
  const tableRows = data.slice(0, 8).map(d => {
    return `| ${escapeSlack(d.trend_name)} | ${d.trend_score || '—'} ${getScoreEmoji(d.trend_score)} | ${formatNumber(d.catalog_match_count)} | ${getGapEmoji(d.gap_assessment)} |`;
  }).join('\n');
  
  // Find biggest gaps
  const gaps = data.filter(d => d.gap_assessment?.includes('HIGH') || d.catalog_match_count < 10);
  const gapText = gaps.length > 0 
    ? `\n*🎯 Biggest Gaps:* ${gaps.slice(0, 3).map(d => escapeSlack(d.trend_name)).join(', ')}`
    : '';
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🗓️ Upcoming & Rising Trends${categoryFilter ? ` — ${formatCategory(categoryFilter)}` : ''}`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `| Title | Score | Coverage | Gap |
|-------|-------|----------|-----|
${tableRows}${gapText}`
        }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Showing NEW and RISING trends. Release dates from public announcements._` }
        ]
      }
    ]
  };
}

function formatRegional(data, regionCode, categoryFilter) {
  if (!data || data.length === 0) {
    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🌍 *No Regional Data for ${regionCode}*\n\nWe may not collect region-specific trends yet. Check Google Trends directly:\n• https://trends.google.com/trends/explore?geo=${regionCode}`
          }
        }
      ]
    };
  }
  
  const regionNames = { 'DE': 'Germany', 'GB': 'UK', 'US': 'United States', 'FR': 'France', 'PL': 'Poland', 'EU': 'Europe' };
  const regionName = regionNames[regionCode] || regionCode;
  
  const resultLines = data.slice(0, 8).map((d, i) => {
    return `${i + 1}. *${escapeSlack(d.trend_name)}* — ${getScoreEmoji(d.trend_score)} ${d.trend_score || '—'}`;
  }).join('\n');
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🌍 Top Trends in ${regionName}${categoryFilter ? ` — ${formatCategory(categoryFilter)}` : ''}`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: resultLines
        }
      }
    ]
  };
}

function formatOpinion(data, entityName) {
  if (!data || data.length === 0) {
    return formatNotFoundWithOpinion(entityName);
  }
  
  const d = data[0];
  const score = d.trend_score || 0;
  const searches = d.internal_search_volume || 0;
  const catalog = d.catalog_match_count || 0;
  const gap = d.gap_assessment || '';
  
  // Generate opinion based on data
  let verdict = '';
  let emoji = '';
  
  if (gap.includes('HIGH') && score >= 60) {
    verdict = `*Strong opportunity.* High trend momentum with genuine catalog gap. Worth pursuing if licensing is feasible.`;
    emoji = '✅';
  } else if (gap.includes('HIGH') && score < 60) {
    verdict = `*Niche opportunity.* Good gap but moderate momentum. Could work for targeted audience, lower priority than hot trends.`;
    emoji = '🟡';
  } else if (gap.includes('SATURATED') || catalog > 100) {
    verdict = `*Already covered.* We have ${catalog}+ designs. New content would need strong differentiation.`;
    emoji = '⚠️';
  } else if (gap.includes('WATCH')) {
    verdict = `*Watch list.* Decent signals but not urgent. Monitor for momentum changes.`;
    emoji = '👀';
  } else {
    verdict = `*Insufficient data.* Can't make strong recommendation. Consider manual research.`;
    emoji = '❓';
  }
  
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `💭 My Take on ${escapeSlack(d.trend_name || entityName)}`, emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} ${verdict}`
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*The Numbers:*\n• Trend Score: ${score}/100 ${getScoreEmoji(score)}\n• Displate Searches: ${formatNumber(searches)}/month\n• Current Catalog: ${formatNumber(catalog)} designs\n• Gap Status: ${getGapEmoji(gap)} ${gap || 'Unknown'}`
        }
      },
      { type: "divider" },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `⚠️ _This is based on trend/search data only. Licensing costs, brand fit, and art complexity not factored. Use as input, not final decision._` }
        ]
      }
    ]
  };
}

function formatNews(entityName) {
  // We can't answer news queries
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📰 *News Query — Outside My Scope*\n\nI track *trend momentum*, not real-time news, store promotions, or announcements.\n\n*For news and deals:*\n• 🎮 Epic Free Games: https://store.epicgames.com/free-games\n• 🔥 r/GameDeals: https://reddit.com/r/GameDeals\n• 📰 PC Gamer: https://pcgamer.com\n• 🎬 Variety (entertainment): https://variety.com`
        }
      },
      ...(entityName ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*What I CAN tell you:*\nAsk "tell me about ${escapeSlack(entityName)}" for trend data on this title.`
        }
      }] : [])
    ]
  };
}

function formatNotFound(entityName) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔍 *${escapeSlack(entityName)}* — Not in Trend Database\n\nI don't have trend data for this title. This usually means:\n• Too new/niche to appear in Google Trends top queries\n• Different spelling in our system\n• Regional trend not captured globally`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Where to check:*\n${getResourceLinks(entityName, category)}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Want me to track this?*\nReact with 👀 and I'll flag it for manual review.`
        }
      }
    ]
  };
}

function formatNotFoundWithOpinion(entityName) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `💭 *Can't Give Opinion on ${escapeSlack(entityName)}*\n\nI don't have trend data to base a recommendation on.\n\n*Where to research manually:*\n${getResourceLinks(entityName, category)}`
        }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Once you've researched, you can add it to the watchlist by reacting 👀 to this message._` }
        ]
      }
    ]
  };
}

function formatHelp() {
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🤖 Trend Tool — What I Can Do", emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Ask me about specific titles:*\n• "Tell me about Silent Hill F"\n• "What do you think about Path of Exile 2?"\n• "How big is Clair Obscur's fandom?"
          
*Compare options:*\n• "Warframe vs Crusader Kings"\n• "Should we invest in Pokemon or Zelda?"

*Browse trends:*\n• "Any big upcoming titles in gaming?"\n• "Top movie trends this week"\n• "Search for Dispatch"

*What I CAN'T do:*\n• Real-time news or announcements\n• Store promotions (Epic free games, etc.)\n• Release dates (I'll point you to calendars)`
        }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `_Data from Google Trends + Displate internal search. Updated weekly._` }
        ]
      }
    ]
  };
}

// ============================================
// MAIN ROUTER
// ============================================

let response;

// Check for help request first
if (original_text.toLowerCase().match(/\b(help|commands|how do you work|what can you do)\b/)) {
  response = formatHelp();
} else {
  switch (query_type) {
    case 'DEEP_DIVE':
      response = formatDeepDive(results, primary_entity);
      break;
      
    case 'COMPARISON':
      response = formatComparison(results, primary_entity, secondary_entity);
      break;
      
    case 'SIZING':
      response = formatSizing(results, primary_entity);
      break;
      
    case 'SEARCH':
      response = formatSearch(results, primary_entity);
      break;
      
    case 'CALENDAR':
      response = formatCalendar(results, category);
      break;
      
    case 'REGIONAL':
      response = formatRegional(results, region, category);
      break;
      
    case 'OPINION':
      response = formatOpinion(results, primary_entity);
      break;
      
    case 'NEWS':
      response = formatNews(primary_entity);
      break;
      
    default:
      if (hasData) {
        response = formatDeepDive(results, primary_entity);
      } else {
        response = formatNotFound(primary_entity || 'your query');
      }
  }
}

// ============================================
// OUTPUT
// ============================================

return [{
  json: {
    response: response,
    delivery: {
      channel_id: channel_id,
      thread_ts: thread_ts,
      response_url: response_url,
      user_id: user_id
    },
    metadata: {
      query_type: query_type,
      primary_entity: primary_entity,
      had_data: hasData,
      results_count: Array.isArray(results) ? results.length : (hasData ? 1 : 0)
    }
  }
}];
