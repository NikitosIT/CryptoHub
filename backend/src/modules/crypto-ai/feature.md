AI-powered crypto chat with predefined prompts. Users can run a prompt for each cryptocurrency token. The limit is 3 requests per day; additional usage requires a subscription. All conversations are stored in the database.

The frontend sends:

```json
{
  "action": "TOKEN_FORECAST",
  "tokenSymbol": "BTC"
}
```

**Endpoint:**
`POST /api/crypto-ai/chat/stream`

Flow:

1. Validate authentication and attach `userId` to the request.
2. Validate the request payload and check the user's daily usage limits.
3. If everything is valid, create a database record with the status `STREAMING`.
4. Start an OpenAI streaming request.
5. Stream response chunks to the frontend via SSE (Server-Sent Events).
6. When generation completes successfully:

   * Save the final response in the database.
   * Update the chat status to `COMPLETED`.
7. If the user stops the generation or leaves the page:

   * Save the partial response (if any).
   * Update the chat status to `ABORTED`.
   * Count it as a used attempt.

Each user's chat history is stored and can be retrieved later.

**Get chat by ID:**
`GET /api/crypto-ai/chat/:id`

Only chats with the status `COMPLETED` are returned.

**Get today's usage:**
`GET /api/crypto-ai/usage/today`
