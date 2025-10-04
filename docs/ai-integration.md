# LLaMA (OpenRouter) AI Integration Guide

This project has migrated from OpenAI to LLaMA (OpenRouter). All AI responses are now served via the `meta-llama/llama-4-scout:free` model through OpenRouters Chat Completions API.

## 1. Overview
- The backend no longer uses OpenAI APIs, keys, degraded-mode handling, or admin diagnostics endpoints.
- The chat feature is powered by a single LLaMA integration using Axios.

## 2. Environment Setup
Add your OpenRouter API key to `backend/.env`:

```
LLAMA_API_KEY=your_openrouter_api_key_here
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Removed variables (no longer used):
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## 3. Backend Integration
- LLaMA service: `backend/services/llamaService.js`
- Chat route: `backend/routes/chatRoutes.js`

Example usage in the route:

```js
const { getLlamaResponse } = require('../services/llamaService');

// inside POST /api/chat
const aiResponse = await getLlamaResponse(userQuery);
return res.json({
  success: true,
  message: aiResponse,
  source: 'llama',
  sessionData: updatedSessionData,
});
```

## 4. Testing the Endpoint
Use cURL to test the chat endpoint locally:

```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"userQuery":"STEM clubs","sessionData":{"grade":8,"interests":["STEM"]}}'
```

Expected JSON response shape:

```json
{
  "success": true,
  "message": "<LLaMA-generated text>",
  "source": "llama",
  "sessionData": { "grade": 8, "interests": ["STEM"], "query_history": ["STEM clubs"], ... }
}
```

If you see the apology message ("Sorry, I could not generate a response."), verify:
- `LLAMA_API_KEY` is set and valid
- Your OpenRouter account has access/quota for `meta-llama/llama-4-scout:free`

## 5. Migration Notes
- Removed:
  - OpenAI environment variables and client calls
  - Degraded-mode handling and admin diagnostics endpoints
- Added:
  - Axios dependency (backend)
  - New LLaMA service (`backend/services/llamaService.js`)
- Status:
  - Project is fully LLaMA-powered using OpenRouter for AI responses.
