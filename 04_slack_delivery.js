// ============================================
// CHATBOT V2 - Slack Delivery
// ============================================
// Posts formatted response back to Slack
// Handles slash commands (response_url) vs mentions (chat.postMessage)

const input = $input.first().json;
const { response, delivery, metadata } = input;

const {
  channel_id,
  thread_ts,
  response_url,
  user_id
} = delivery;

// ============================================
// DELIVERY METHOD SELECTION
// ============================================

let deliveryMethod;
let deliveryPayload;

if (response_url) {
  // Slash command - use response_url
  // in_channel makes it visible to everyone, ephemeral is private
  deliveryMethod = 'response_url';
  deliveryPayload = {
    url: response_url,
    method: 'POST',
    body: {
      response_type: 'in_channel', // or 'ephemeral' for private
      blocks: response.blocks,
      text: `Trend Tool response for ${metadata.query_type}` // Fallback text
    }
  };
} else if (thread_ts) {
  // Reply in thread (for mentions)
  deliveryMethod = 'chat.postMessage';
  deliveryPayload = {
    channel: channel_id,
    thread_ts: thread_ts,
    blocks: response.blocks,
    text: `Trend Tool response for ${metadata.query_type}`
  };
} else {
  // Direct message or channel post
  deliveryMethod = 'chat.postMessage';
  deliveryPayload = {
    channel: channel_id,
    blocks: response.blocks,
    text: `Trend Tool response for ${metadata.query_type}`
  };
}

// ============================================
// OUTPUT
// ============================================

return [{
  json: {
    delivery_method: deliveryMethod,
    payload: deliveryPayload,
    metadata: metadata
  }
}];
