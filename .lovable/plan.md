

# Plan: Upgrade AI Copilot — Full Authorization + Attachments + Image Generation + Self-Healing

## Summary

Merge the AI Operator's tool-calling capabilities into the main AI Copilot, add file attachment support (images/documents), add AI image generation, and implement automatic error retry logic.

## Architecture

The main VesselCommandInterface currently calls `ai-copilot` (streaming text only). The `ai-operator` has tool-calling with database operations. We will merge them into a single upgraded `ai-copilot` edge function.

```text
┌─────────────────────────────┐
│  VesselCommandInterface     │
│  + Attachment button        │
│  + Image display in chat    │
│  + Auto-retry on errors     │
└──────────┬──────────────────┘
           │ POST { messages, attachments?, action? }
           ▼
┌─────────────────────────────┐
│  ai-copilot (merged)        │
│  • All operator tools       │
│  • generate_image tool      │
│  • Tool-calling + streaming │
│  • Error self-recovery      │
└─────────────────────────────┘
```

## Implementation Steps

### 1. Create storage bucket for chat attachments
- SQL migration to create `chat-attachments` storage bucket (public read)
- RLS policies: authenticated admins can upload, public can read

### 2. Rebuild `ai-copilot` edge function with full operator capabilities
- Import all 6 operator tools (query_analytics, run_classification, create_admin_user, update_contact, export_report, create_segment)
- Add new `generate_image` tool that calls `google/gemini-2.5-flash-image` via Lovable AI gateway and returns the base64 image
- Add `analyze_attachment` tool for processing uploaded images/files using `google/gemini-2.5-flash` with vision
- Implement tool-calling loop: first call (non-streaming with tools) → execute tools → follow-up call (streaming with results)
- Update system prompt to declare full operational authority
- Add automatic retry logic: if AI gateway returns 429/500, wait 2s and retry once before failing
- Log all tool executions to `ai_operator_logs` for audit trail

### 3. Update `CopilotMessage` component
- Detect base64 image data or image URLs in assistant messages
- Render `<img>` tags for generated images with download button
- Support rendering attachment previews (thumbnails for uploaded images)

### 4. Update `VesselCommandInterface` — add attachment support
- Add paperclip/attachment button next to input
- Hidden file input accepting images (jpg, png, webp) and documents (pdf, csv, xlsx)
- On file select: upload to `chat-attachments` bucket, get public URL
- Include attachment URL in the message payload sent to edge function
- Show attachment preview thumbnail in user message bubble
- Add image display support for AI-generated images in assistant bubbles

### 5. Self-healing error handling
- Frontend: if `streamChat` gets a 500 error, automatically retry once after 2 seconds
- Frontend: if retry also fails, show error with "Retry" button
- Edge function: wrap tool execution in try/catch, if a tool fails, pass the error back to the AI so it can adapt its response
- Edge function: if AI gateway call fails with 500, retry once before returning error

### Technical Details

**New message type** (extended):
```typescript
type Msg = { 
  role: "user" | "assistant"; 
  content: string;
  attachments?: { url: string; type: string; name: string }[];
  images?: string[]; // base64 generated images
};
```

**Image generation** uses `google/gemini-2.5-flash-image` model with `modalities: ["image", "text"]`. The generated base64 is stored in the `chat-attachments` bucket to avoid passing large payloads back through the stream. A public URL is returned instead.

**Files to create/edit:**
- `supabase/functions/ai-copilot/index.ts` — major rewrite (merge operator tools + image gen + retry)
- `src/components/admin/vessel/VesselCommandInterface.tsx` — add attachment UI + image display + retry
- `src/components/admin/copilot/CopilotMessage.tsx` — image rendering support
- SQL migration — `chat-attachments` storage bucket + policies

