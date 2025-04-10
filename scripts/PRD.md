# Overview
The **Australian Mechanic Dispute Resolution** application is a web-based tool designed to help Australian consumers generate professional legal documents for resolving disputes with mechanics. It streamlines the process of creating formal documentation needed for various dispute resolution channels, potentially including small claims courts or consumer affairs bodies. The application aims to empower users who feel they have been unfairly treated by a mechanic by providing an accessible and guided way to prepare necessary paperwork.

# Core Features
- **Multi-Step Guided Form:** Collects user details, mechanic information, dispute specifics, and desired outcomes through a clear, step-by-step process.
- **Secure Direct Evidence Upload:** Allows users to upload supporting documents and images (e.g., invoices, photos of damage, communication records) directly and securely to Cloudflare R2 storage using **presigned URLs**. This ensures files are uploaded efficiently without passing through the application server.
- **AI-Powered Document Generation:** Utilizes OpenAI's models (or potentially Anthropic, pending clarification) to generate a formatted legal document based on the information provided by the user and references to the uploaded evidence stored in R2.
- **Secure Payment Processing:** Integrates with Stripe to handle payments for the document generation service. Includes webhook integration for payment confirmation and status updates. Offers a bypass option for development/testing.
- **Document Review & Download:** Provides a review step for users to check the generated document before payment and allows downloading the final document (stored securely in R2) after successful payment.
- **Persistent State:** Uses browser `localStorage` to save user progress through the form steps, entered data, and uploaded file references, allowing users to resume their claim later.
- **Responsive Design:** Built with Tailwind CSS and shadcn/ui components, ensuring usability across different devices (desktops, tablets, mobiles).

# User Experience
- **User Personas:** Individuals in Australia who have encountered issues with mechanic services (e.g., faulty repairs, overcharging, damage to vehicle) and need assistance preparing formal dispute documentation. Likely users with varying levels of technical or legal expertise.
- **Key User Flows:**
    1.  **Landing & Initiation:** User visits the site, understands the service, and decides to start a claim.
    2.  **Information Input (Step 1):** User fills in personal details, mechanic details, vehicle information, and a description of the dispute. Form validation ensures required fields are completed correctly.
    3.  **Evidence Upload (Step 2):** User selects files. The frontend requests a secure, time-limited presigned upload URL from the backend API (`/api/get-upload-url`). The browser then uploads the file *directly* to Cloudflare R2 using this URL. Progress indicators show upload status. Users can remove file references if needed. Validation ensures at least one file is uploaded.
    4.  **Review (Step 3):** User reviews all entered information and the list of uploaded files before proceeding. The system generates the draft document in the background using the selected LLM, referencing the file URLs in R2.
    5.  **Payment (Step 4):** User is presented with the cost and proceeds to pay via Stripe Elements. The application handles payment intent creation and confirmation.
    6.  **Download (Step 5):** Upon successful payment confirmation (handled via Stripe webhooks), the user can download the final generated document (likely fetched securely from R2).
- **UI/UX Considerations:**
    -   Clean, professional interface using shadcn/ui components.
    -   Clear step indicator to show progress.
    -   Persistent state saving to prevent data loss.
    -   Toast notifications for user feedback.
    -   Error handling and clear validation messages.
    -   Use of icons (Lucide React).

# Technical Architecture
- **Frontend Framework:** Next.js (v15+) using the App Router.
- **Styling:** Tailwind CSS with shadcn/ui component library.
- **State Management:** React hooks (`useState`, `useEffect`) combined with `localStorage`. React Hook Form for form handling (using Zod schemas).
- **Backend/Serverless:** Cloudflare Workers (via OpenNext adapter) for handling API requests. Key endpoints include:
    -   `/api/get-upload-url`: Generates secure, time-limited presigned PUT URLs for direct-to-R2 uploads using R2 binding's `createPresignedUrl`.
    -   `/api/generate-document`: Orchestrates document generation using an LLM, referencing file details.
    -   `/api/create-checkout-session`: Creates Stripe Checkout sessions.
    -   `/api/check-payment`: Checks Stripe session status post-redirect.
    -   `/api/stripe-webhook`: Securely handles Stripe webhook events (requires signature verification and fulfillment logic).
- **File Storage:** Cloudflare R2 for storing user-uploaded evidence files and potentially the final generated documents. Accessed via direct presigned URLs for uploads and likely secured backend access for generation/downloads.
- **AI Document Generation:** OpenAI API or Anthropic API (accessed via a Cloudflare Worker, requires clarification).
- **Payment Gateway:** Stripe API for creating checkout sessions, handling payments, and processing webhooks.
- **Deployment:** Cloudflare Pages & Workers. `wrangler.toml` configures the worker, R2 bindings, environment variables, and routes.
- **Key Libraries:** (Largely unchanged, but note removal of `/api/direct-upload`)
    -   `next`, `react`, `react-dom`
    -   `tailwindcss`, `autoprefixer`, `postcss`
    -   `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `lucide-react`
    -   `react-hook-form`, `@hookform/resolvers`, `zod`
    -   `stripe` (server-side), `@stripe/stripe-js` (client-side)
    -   `openai` or `@anthropic-ai/sdk` (needs confirmation)
    -   `@opennextjs/cloudflare`

# Development Roadmap
- **MVP Requirements:** (Largely unchanged, but upload mechanism refined)
    1.  Functional multi-step form.
    2.  Secure **direct-to-R2** file upload using presigned URLs.
    3.  Integration with LLM for document generation.
    4.  Stripe integration for payment processing (including webhook fulfillment).
    5.  Ability for users to download the generated document post-payment.
    6.  Basic UI, navigation, static pages.
    7.  Deployment setup on Cloudflare.
- **Future Enhancements:** (Unchanged)

# Logical Dependency Chain
1.  **Foundation:** Setup Next.js, Tailwind, shadcn, Cloudflare basics.
2.  **Form Structure:** Multi-step components, state management.
3.  **Step 1 - Details:** Form fields, validation.
4.  **Step 2 - Upload:**
    a.  Implement backend `/api/get-upload-url` to generate R2 presigned PUT URLs using `env.DOCUMENTS_BUCKET.createPresignedUrl`.
    b.  Implement frontend file selection and direct upload logic in `lib/file-utils.js` using the fetched presigned URL.
5.  **Step 3 - Review:** Display data, trigger `/api/generate-document`.
6.  **Step 4 - Payment:** Integrate Stripe (`/api/create-checkout-session`, frontend Elements).
7.  **Webhook Handling:** Implement fulfillment logic in `/api/stripe-webhook` for `checkout.session.completed`.
8.  **Step 5 - Download:** Provide secure download access post-payment confirmation (via webhook).
9.  **Static Pages & Refinement.**

# Risks and Mitigations
- **Technical Challenges:**
    -   *Risk:* Correctly configuring R2 permissions and presigned URL parameters (expiry, content-type). *Mitigation:* Test thoroughly, consult Cloudflare R2 documentation for `createPresignedUrl` options.
    -   *Risk:* Handling LLM failures/long processing times. *Mitigation:* Asynchronous processing, user feedback, webhooks/polling.
    -   *Risk:* Securely handling Stripe webhooks. *Mitigation:* Strictly follow Stripe's signature verification guidelines. Implement robust fulfillment logic with idempotency checks.
- **MVP Scope:** (Unchanged)
- **Resource Constraints:** (Unchanged)
- **Legal/Compliance:** (Unchanged)
- **External Service Dependency:** (Unchanged)

# Appendix
- **Source Code:** [Provide link or reference]
- **Deployment Environment:** Cloudflare Pages & Workers
- **Key Configuration Files:** `package.json`, `next.config.mjs`, `wrangler.toml`, `tailwind.config.js`, `tsconfig.json`
- **Environment Variables:** See `.env.example`.