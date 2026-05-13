### Why I wrote it this way

- **Word count constraint (90-110 words):** Without a constraint, the model writes
  250-word essays. The audit card has limited space and users won't read walls of text.
- **"Plain prose only":** First drafts used bullet points, which made it look
  like the engine output rather than a summary. Prose reads warmer.
- **"Be specific, use the actual numbers":** Without this, the model wrote
  generic sentences like "you could save significantly." With it, it writes
  "$60/month by switching from Business to Pro."
- **"End with one actionable insight":** Gives the summary a clear conclusion
  rather than trailing off.

### What I tried that didn't work

1. **Asking for "a friendly, casual tone":** Produced summaries that were too
   chatty — felt like a chatbot, not an analyst.
2. **Including full plan descriptions in the context:** Made the prompt too
   long and the model started summarising the plans instead of the savings.
3. **No word count instruction:** First output was 280 words, way too long for
   the UI card.
4. **System prompt only (no user message):** The API requires at least one user
   message — passing the entire prompt as a system message with an empty user
   message caused the model to wait for input.

### Fallback behaviour

If the Anthropic API fails (network error, rate limit, invalid key), the
`/api/summary` route catches the error and returns a template-generated summary
built from the same audit data. The UI never shows an error state — it shows the
template text instead. The `source` field in the response ("ai" vs "template")
is logged but not shown to users.