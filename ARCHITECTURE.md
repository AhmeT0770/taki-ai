# Project Overview

## Application Flow
- The main application in `App.tsx` lets users upload a jewelry reference photo, choose a target resolution (2K/4K/8K) and aspect ratio (1:1 or 9:16), and then kicks off shoot planning plus generation when they start processing.【F:App.tsx†L16-L120】【F:App.tsx†L205-L338】
- `startGeneration` calls `planShoots` to create three conceptual briefs, seeds UI cards for each concept, and then spawns `generateSingleImage` to produce AI renders in parallel for the chosen resolution and crop.【F:App.tsx†L236-L304】
- Each card supports re-running generation, opening the prompt-based editor, and saving the rendered image. Saved images are uploaded to Supabase Storage and recorded in the `saved_images` table for retrieval in the gallery view.【F:App.tsx†L306-L390】【F:App.tsx†L392-L437】
- Navigation toggles between the creation flow, gallery, and password-gated feedback page via the `currentPage` state, allowing the same shell to host all experiences.【F:App.tsx†L392-L472】【F:App.tsx†L496-L552】

## AI Services
- `services/geminiService.ts` exposes `planShoots`, which either proxies to the `/api/plan-shoots` serverless route in production or directly calls Gemini 2.5 Flash locally with a schema-validated JSON response describing concepts.【F:services/geminiService.ts†L8-L73】
- The same module provides `generateOrEditImage`, routing to `/api/generate-image` in production or invoking the configured Gemini image model locally with size and aspect-ratio controls.【F:services/geminiService.ts†L75-L149】
- Serverless handlers in `api/plan-shoots.js` and `api/generate-image.js` mirror the local logic with CORS headers and environment-supplied API keys to secure hosted calls.【F:api/plan-shoots.js†L1-L76】【F:api/generate-image.js†L1-L70】

## Data & Feedback Persistence
- `services/supabaseClient.ts` initializes the Supabase client from Vite env vars and uploads rendered images to the public `generated-images` bucket before writing records to `saved_images`. Gallery retrieval and deletions use the same client, including blob cleanup from storage.【F:services/supabaseClient.ts†L1-L66】【F:services/supabaseClient.ts†L68-L110】
- The feedback module reads and writes threaded messages in the `feedback_messages` table, marking admin replies and exposing helper functions consumed by the `Feedback` component.【F:services/supabaseClient.ts†L112-L160】【F:components/Feedback.tsx†L1-L74】

## UI Components
- `components/OutfitCard` renders each generated concept card with controls for editing, re-generating, and saving images surfaced by `App.tsx`.【F:components/OutfitCard.tsx†L1-L157】
- Modal components (`ImageEditorModal` and `SaveImageModal`) provide prompt-based editing and naming flows for saving to Supabase storage, while `Gallery` and `Feedback` deliver dedicated routes for browsing saved items and capturing tester feedback.【F:components/ImageEditorModal.tsx†L1-L213】【F:components/SaveImageModal.tsx†L1-L114】【F:components/Gallery.tsx†L1-L177】【F:components/Feedback.tsx†L1-L168】
