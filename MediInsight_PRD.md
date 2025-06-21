# MediInsight MVP – Technical PRD & Architecture Design

## 1. Technical Objectives and MVP Scope

**Product Overview:** MediInsight is an MVP web application that helps users make sense of their medical documents using AI. The system lets users upload medical documents (PDFs, images, or text) and leverages OCR (Optical Character Recognition) and OpenAI's GPT-4 to produce helpful outputs:

- **Document Summary:** A concise, human-readable summary of the document's content (e.g. doctor's notes, lab results).
- **Key Insights:** Highlighting important findings (abnormal results, critical values, repeated recommendations, new diagnoses, etc.).
- **Health Card Overview:** A structured "snapshot" of the patient's current health status, including any alerts (urgent issues) and suggestions (recommendations or next steps).
- **Medical Timeline:** A chronological list of medical events or findings extracted from the document.
- **Suggested Questions:** A set of questions the patient could ask their doctor based on the document's content.

**Technical Objectives:** The MVP focuses on building an end-to-end vertical slice of this functionality with a full TypeScript stack:

- **Frontend:** A responsive React UI using Next.js 13 App Router, Tailwind CSS, and **shadcn/ui** (Radix UI-based component design system) for uploading files, authenticating, and displaying results.
- **Backend:** Node.js (Next.js API routes) for server-side logic – handling file processing, calling external APIs (OCR, GPT), and interacting with the database.
- **AI Integration:** Connect to external AI services – Google Vision API for OCR (with Tesseract as a fallback), and OpenAI GPT-4 API for text analysis and generation.
- **Cloud Services:** Use Firebase for infrastructure – Firebase Auth for user login (Google OAuth), Firestore for storing document data & analysis results, and Firebase Storage for storing uploaded files.
- **Deployment:** Host the application on Vercel for ease of deployment and integration with Next.js.

**MVP Scope:** The MVP will implement the core user journey:

1. **Authentication:** Users can log in with Google via Firebase Auth and have a secure, personalized session.
2. **Document Upload & Processing:** Users can upload a medical document (image or PDF). The system will extract text from it (OCR) and then generate the summary, insights, health card, timeline, and questions using GPT-4.
3. **Results Display:** The app displays the AI-generated outputs in a clear dashboard format. The summary and insights are shown in easy-to-read text, the health card as a highlights panel, the timeline as an ordered list of events, and the suggested questions as a list.
4. **Data Persistence:** The uploaded file and the AI results are stored so that users can revisit previous documents. (For MVP, this could be a simple list of past uploads for the logged-in user.)

**Out of Scope for MVP:** Advanced features like cross-document aggregation (combining multiple documents into one timeline or health profile), extensive manual editing of data, fine-grained user roles, or broad internationalization are beyond the initial scope. The MVP will focus on a single-user use case (the patient themselves) with analysis of one document at a time.

## 2. System Architecture & Folder Structure

### Architecture Overview

MediInsight's architecture is a full-stack TypeScript web application, utilizing Next.js for both frontend and backend in a unified project. Key components include:

- **Next.js App (React Frontend + API Routes):** The Next.js 13 App Router serves the React frontend pages and provides API route endpoints (Node.js functions) for backend logic. **The UI is built using a design system based on shadcn/ui (Radix UI + Tailwind CSS), ensuring consistent, accessible components across the app.** This single Next.js codebase on Vercel handles both the client UI and server API.
- **Firebase Services:**

  - _Authentication:_ Firebase Auth (with Google Sign-In) secures the app. Users authenticate on the frontend; Firebase manages session persistence and ID tokens.
  - _Storage:_ Uploaded files are stored in Firebase Storage (backed by Google Cloud Storage). This allows secure, scalable storage of potentially large PDF/image files.
  - _Database:_ Firestore is used to store document records and analysis results (summary, insights, etc.) associated with each user.

- **AI APIs:**

  - _OCR:_ Use Google Cloud Vision API as the primary OCR service to extract text from images or PDFs in storage. (If Vision is unavailable or the document is not easily handled by Vision, a secondary fallback uses Tesseract OCR for basic text extraction.)
  - _GPT-4:_ OpenAI's GPT-4 API analyzes the extracted text and generates the summary, insights, timeline, and questions. These API calls are made server-side to keep API keys secure.

**Data Flow:** The following steps outline the end-to-end processing of an uploaded document:

- **User Login:** The user authenticates via Google; Firebase Auth provides an ID token identifying the user.
- **File Upload:** The user uploads a file from the browser. The file is either uploaded directly to Firebase Storage via the Firebase SDK (client-side) or sent to a Next.js API route which streams it to storage. (For the MVP we likely use the Firebase SDK for direct uploads to leverage its handling of large files and network resilience.)
- **File Processing:** After the file is uploaded, the client calls an API endpoint (e.g. `/api/analyze`) with a reference to the file. The Next.js API route on the server then:

  - Verifies the user's identity (by checking the Firebase Auth ID token included in the request).
  - Downloads or accesses the file from Firebase Storage (using a secure URL or the Firebase Admin SDK).
  - Performs OCR on the file: If the file is an image (JPEG/PNG), use the Vision API's `textDetection`. If it's a PDF, use Vision API's document text detection (or convert the PDF to images page-by-page for OCR). The Vision API supports OCR on PDF/TIFF files stored in Cloud Storage. If the Vision API fails or isn't available, the system falls back to Tesseract OCR on the server as a backup.
  - Cleans/normalizes the extracted text (simple preprocessing such as removing extra whitespace or headers/footers).
  - Calls the OpenAI GPT-4 API with the cleaned text and carefully crafted prompts (see Sections 6–8 on prompt design) to generate the required outputs (summary, insights, etc.).
  - Stores the results in Firestore (under a new document entry for the user) and returns the results in the API response.

- **Displaying Results:** The frontend, upon receiving the analysis results, updates the UI to show the summary, insights list, timeline, and questions. It may also cache the results or fetch them from Firestore for persistence. Subsequent visits (or a "My Documents" page) can list past analyses by querying Firestore.

**Security & Privacy:** User data is isolated per Firebase Auth user – each user's files in storage and documents in Firestore include the user's UID, and security rules ensure only that user (or server-side processes on their behalf) can access their data. All communication is over HTTPS (enforced by Firebase and Vercel), and sensitive API keys (OpenAI, Google Cloud) are kept in server environment variables (never exposed to the client).

Overall, the architecture is serverless/cloud-oriented: Next.js API routes run on Vercel's serverless functions, Firebase handles stateful concerns (auth, storage, database), and external APIs provide the AI capabilities. This makes the MVP quickly deployable and scalable.

### Project Folder Structure

The project follows a logical structure separating frontend pages, API routes, components, and utility modules. All code is written in TypeScript for type safety across the stack. Below is a suggested high-level folder structure:

- **`/app`** – Next.js App Router directory for pages and API routes.

  - **`/app/page.tsx`** – Landing page (e.g. a home or upload page, which might redirect to login or show an upload form if authenticated).
  - **`/app/dashboard/page.tsx`** – Main application page after login, possibly showing an upload interface and/or a list of analyzed documents.
  - **`/app/api/analyze/route.ts`** – API route to handle document analysis (HTTP POST). In Next.js 13 App Router, a `route.ts` file defines an API endpoint.
  - _(Additional API routes)_ – e.g., `/app/api/documents/route.ts` (GET to list the user's documents) or `/app/api/documents/[id]/route.ts` (GET to fetch a specific document's result). These may not be strictly necessary if the frontend uses Firestore directly, but can be provided for flexibility and additional security.

- **`/components`** – Reusable React components for the UI (using **shadcn/ui** component primitives like `Button`, `Card`, `Dialog` for consistency).

  - **`/components/FileUpload.tsx`** – Component for the file selection/upload UI (could integrate drag-and-drop or a styled file input, and handle uploading to Firebase Storage).
  - **`/components/DocumentSummary.tsx`** – Component to display the document summary text.
  - **`/components/InsightsList.tsx`** – Component to display key insights as a list.
  - **`/components/HealthCard.tsx`** – Component for the health overview card (showing status, alerts, suggestions).
  - **`/components/Timeline.tsx`** – Component to display the timeline of events (e.g., as a vertical list or timeline UI).
  - **`/components/QuestionsList.tsx`** – Component to display suggested questions.

- **`/lib`** – Modules for integrating with external services and shared backend logic (these can be imported in API routes and, where appropriate, in the frontend).

  - **`/lib/firebaseClient.ts`** – Initializes the Firebase client SDK (with config) for use in the browser (Auth, Firestore, Storage).
  - **`/lib/firebaseAdmin.ts`** – Initializes the Firebase Admin SDK for use on the server (for verifying tokens or accessing Firestore/Storage with admin privileges).
  - **`/lib/ocr.ts`** – Functions for OCR processing. For example, `extractText(filePath: string): Promise<string>` that calls the Vision API or Tesseract as needed to extract text.
  - **`/lib/gpt.ts`** – Functions to interface with the OpenAI API. For example, `analyzeDocument(text: string): Promise<AnalysisResult>` which calls GPT-4 with the appropriate prompts and returns structured results.
  - **`/lib/prompts.ts`** – Defines prompt templates or helper functions to generate prompts for GPT-4 (for summary, insights, etc., see Prompt Engineering sections below).

- **`/types`** – TypeScript type definitions and interfaces shared across the app.

  - **`/types/models.ts`** – Defines interfaces for data models (e.g. `User`, `MedicalDocument`, `AnalysisResult`, etc.) to ensure consistent data handling across frontend, backend, and database.
  - **`/types/api.ts`** – Defines request/response interfaces for API routes (for instance, `AnalyzeRequest` and `AnalyzeResponse` corresponding to the analyze endpoint).

- **`/styles`** – Global styles or Tailwind CSS configuration (if any global CSS is needed). Tailwind is configured via `tailwind.config.js` and an entry CSS file (e.g. `globals.css` imported in `app/layout.tsx`).

**Root Config Files:**

- `next.config.js` – Next.js configuration (e.g., custom webpack settings, environment variable passthrough).
- `tsconfig.json` – TypeScript configuration (enable strict mode, set up path aliases if needed).
- `.eslintrc.json` – ESLint configuration for linting (extends Next.js/React and TypeScript recommended rules, integrates Prettier).
- `package.json` – Lists all dependencies (e.g., `next`, `react`, `firebase`, `openai`, `@google-cloud/vision`, `tesseract.js`, etc.) and contains scripts for build and development.
- `.env.local` – Environment variables for local development (OpenAI API key, Google Cloud credentials, etc.). In production (Vercel), these are set via the platform's environment settings.

This structure organizes the code by feature and functionality, making it easy to maintain. Frontend components are separated from backend logic, and shared code (types and utility functions) resides in common directories. Using Next.js App Router conventions (co-locating pages and API routes under `app/`) keeps related code together and leverages Next.js serverless functions for backend needs.

## 3. API Endpoints and Data Models

The MVP exposes a few API endpoints (via Next.js API routes) to the client. All endpoints expect and return JSON, and use Firebase Auth for security (the client includes an ID token with each request which the server will verify). Below are the primary endpoints with their request/response models defined as TypeScript interfaces:

- **POST `/api/analyze`** – Trigger analysis of an uploaded document.
  **Description:** Kicks off OCR and GPT-4 analysis for a given file. The client should call this after uploading a file to storage.
  **Request:** The request body contains a reference to the file (e.g., the file's storage path or a download URL) and possibly metadata:

  ```ts
  interface AnalyzeRequest {
    filePath: string; // Path in Firebase Storage (e.g. "users/<uid>/documents/<filename>")
    fileName: string; // Original name of the file (optional, for logging or file-type handling)
    // No need for userId here; the server derives it from the auth token
  }
  ```

  _Note:_ The Firebase Auth ID token is sent in request headers (e.g. `Authorization: Bearer <ID_TOKEN>`) or via a secure cookie, so the server can identify and authorize the user.

  **Response:** If successful, returns the analysis results for that document:

  ```ts
  interface AnalyzeResponse {
    documentId: string; // Unique ID for the analysis (e.g. Firestore document ID)
    summary: string; // Human-readable summary of the document
    insights: string[]; // List of key insights or notable findings
    healthCard: {
      status: string; // Brief summary of current health status
      alerts: string[]; // Any urgent issues or abnormal values
      suggestions: string[]; // Recommended actions or next steps
    };
    timeline: {
      date: string; // Date or time of the event (e.g. "2023-01-15")
      event: string; // Description of the medical event
    }[];
    questions: string[]; // Suggested questions for the patient to ask their doctor
  }
  ```

  **Example (abridged) response:**

  ```json
  {
    "documentId": "abc123",
    "summary": "Dr. Smith's report from Jan 2023 indicates that the patient has improved liver function...",
    "insights": [
      "Liver enzyme ALT is slightly elevated (55 U/L, normal < 44 U/L).",
      "Repeat ultrasound is recommended in 6 months."
    ],
    "healthCard": {
      "status": "Liver function improving, mild enzyme elevation.",
      "alerts": ["Mild ALT elevation"],
      "suggestions": ["Follow up with ultrasound in 6 months"]
    },
    "timeline": [
      {
        "date": "2022-07-10",
        "event": "Initial diagnosis of fatty liver made via ultrasound."
      },
      {
        "date": "2023-01-15",
        "event": "Follow-up blood test shows improved liver enzymes."
      }
    ],
    "questions": [
      "What could be causing the elevated liver enzymes?",
      "Are there lifestyle changes I should continue to improve liver health?"
    ]
  }
  ```

  On the server side, upon receiving the analyze request, we verify the user's auth token, perform the OCR and GPT-4 analysis (as described in Section 2), save the results to Firestore, and return the JSON. In case of errors (e.g., OCR failure or OpenAI error), the endpoint will return an error response with an appropriate HTTP status code and error message for the frontend to handle.

- **GET `/api/documents`** – _(Optional in MVP)_ Retrieve a list of past document analyses for the logged-in user.
  **Description:** Returns a list of the user's documents (e.g., for displaying a dashboard of past uploads).
  **Response:** An array of document metadata, for example:

  ```ts
  interface DocumentSummary {
    documentId: string;
    fileName: string;
    uploadedAt: string;
    summary: string;
  }
  ```

  The server would query Firestore for all documents owned by the authenticated user (using the user's UID from the Auth token) and return the list. (This endpoint isn't strictly required if the frontend reads Firestore directly, but it can be useful for Next.js SSR or additional security since the server can enforce user identity checks.)

- **GET `/api/documents/[id]`** – _(Optional)_ Retrieve full analysis details for a specific document by ID.
  **Description:** Given a document ID (as a path parameter), returns the full analysis result for that document (same shape as `AnalyzeResponse`). This could also be handled by direct Firestore access on the client, but providing an API endpoint offers a secure, standardized way to fetch the data without exposing Firestore queries on the client.

All requests and responses use JSON. The API layer is kept thin; it mostly validates requests, ensures the user is authorized, and delegates to internal modules for heavy lifting (OCR and GPT calls). Using TypeScript interfaces for data models ensures the frontend and backend share a consistent data contract, and helps catch errors during development.

## 4. Authentication Flow (Firebase Auth with Google Login)

Authentication is handled by Firebase Authentication, using Google as the identity provider. This provides a quick and secure login experience without our app needing to manage passwords.

- **Login UI:** On the frontend, unauthenticated users are prompted with a "Sign in with Google" button. When clicked, we initiate the Firebase Auth Google OAuth flow. For example, using Firebase's modular Web SDK:

  ```ts
  import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
  ```

  This opens a Google OAuth popup. After the user signs in and consents, Firebase provides authentication credentials and we obtain an ID token for the user session.

- **Session Management:** Firebase Auth persists the user session (via cookies or internal token storage). The frontend can listen to auth state changes to detect login status. The ID token is refreshed by Firebase as needed and can be retrieved when making API calls.

- **Server-side Verification:** When the client calls protected API routes (like the analyze endpoint), it includes the Firebase ID token (e.g., in an `Authorization: Bearer <token>` header). On the server, we verify this token using the Firebase Admin SDK before fulfilling the request:

  ```ts
  // Pseudo-code for token verification in an API route
  import { getAuth } from "firebase-admin/auth";
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  const decodedToken = await getAuth().verifyIdToken(idToken);
  const uid = decodedToken.uid;
  ```

  This ensures only authenticated users can invoke the analysis, and it tells us which user's data to access.

- **Post-Login Navigation:** After a successful login, the app routes the user to the main application (e.g., the dashboard page). We use Firebase Auth state on the frontend to guard routes: if not authenticated, redirect to login; if authenticated, allow access.

In summary, the user experience is: open the app → click "Sign in with Google" → authenticate via Google OAuth → Firebase provides an ID token → the app uses that state (and token) for UI logic and to secure backend interactions.

## 5. File Upload and OCR Handling

This section describes how user files are uploaded and processed for text extraction:

- **Client-side Upload to Storage:** We use Firebase Storage for file uploads. After the user selects a file (via an `<input type="file">` or a drag-and-drop component), the file is uploaded directly to Firebase Storage using the Firebase Web SDK. This approach handles large file uploads with built-in retry and progress mechanisms. The file can be stored under a path namespaced by user and document. For example, for user UID `12345` uploading `report.pdf`, we might use a path like `users/12345/documents/report.pdf` (or a random ID in place of the filename to avoid collisions).
  _Firebase Storage SDK example:_

  ```ts
  import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
  const storage = getStorage();
  const fileRef = ref(storage, `users/${userId}/documents/${file.name}`);
  const task = uploadBytesResumable(fileRef, file);
  task.on("state_changed", (snapshot) => {
    // Optionally, update UI with progress from snapshot.bytesTransferred
  });
  await task; // wait for upload completion
  // We now have the file in Storage and can proceed to call the analysis API
  ```

  In the MVP, we may not need the file's download URL on the client; instead, we can send the known storage `filePath` (e.g., `users/12345/documents/report.pdf`) to the backend. The backend can then reconstruct a secure download URL or use the Firebase Admin SDK to access the file.

- **Storage Security:** We will define Firebase Storage security rules such that each authenticated user can write to a `users/<uid>/documents/*` path and read their own files, but no one else's. By default, Firebase Storage rules can ensure files are not publicly accessible; our server (with admin privileges) can still read the file for processing regardless of client read permissions.

- **Server-side OCR Processing:** Once the file is uploaded and the client triggers the `/api/analyze` endpoint, the server performs the OCR step:

  - It locates the file in Firebase Storage (using the path provided, and either fetching via a generated URL or the Admin SDK).
  - **Google Vision API:** For accurate text extraction, we use Google Cloud Vision API. If the file is an image, we call the Vision API's image text detection. If it's a PDF, we use the Vision API's document text detection (which supports PDF/TIFF input asynchronously). According to Google's documentation, _"The Vision API can detect and transcribe text from PDF and TIFF files stored in Cloud Storage"_. In practice, this may involve an asynchronous request; for MVP, we could simplify by converting PDF pages to images and sending those if needed.
  - **Tesseract Fallback:** If the Vision API is not available or fails (due to an error or quota issue), we fall back to using Tesseract OCR on the server. Tesseract is an open-source OCR engine that can handle images reasonably well (and by extension PDFs if we convert pages to images), though it may be less accurate. This ensures that we attempt to get text from the document even if the primary service fails.
  - **Post-OCR Cleanup:** After OCR, the raw text might contain noise (e.g., OCR artifacts, page headers repeated on each page, etc.). We may do light cleanup: remove non-text artifacts, drop common headers/footers, and normalize whitespace. This makes the text input to GPT-4 cleaner. For MVP, this will be simple (since GPT-4 can tolerate some noise), but it's good to strip out obvious irrelevant text to maximize prompt quality.

In summary, the file upload and OCR flow is: _Client uploads file to Firebase Storage → backend fetches file → backend uses Vision API to extract text (with Tesseract as backup) → cleaned text is obtained for analysis_. This setup leverages powerful OCR capabilities while keeping the flow secure (the file stays in our controlled storage, and only text is sent to OpenAI). It also limits cost — sending the entire file to GPT-4 is not feasible, so OCR is an essential step to extract text.

## 6. GPT-4 Integration Flow and Abstraction

After obtaining text from the medical document, the core intelligence of MediInsight comes from integrating with OpenAI's GPT-4 to analyze the text and generate the desired outputs. The integration is designed to be modular and abstracted so that the prompting logic and API calls are well encapsulated. Key points of the GPT-4 integration:

- We will create a dedicated module (e.g., `lib/gpt.ts`) to handle all interactions with the OpenAI API. This module will construct prompts and parse responses, keeping this logic separate from request-handling code.
- **Prompt Construction:** For each type of output (summary, insights, timeline, questions), we define a prompt template or strategy (see Section 7 on Prompt Engineering). This includes instructions and possibly examples. The extracted document text (or a truncated portion if it's very long) is included as context for the prompt.
- **API Call:** Using OpenAI's Node.js client or a simple `fetch` to their REST API, we call GPT-4 with our prompt. We will set parameters such as temperature (likely a low value for factual consistency) and any system message to guide tone (e.g., instruct the model to be a compassionate medical assistant).
- **Response Handling:** The response from GPT-4 is expected to contain the structured outputs (we'll instruct the model to format answers in a predictable way). The module will parse the model's output into our `AnalysisResult` format (as defined in our types).
- **Error and Retry:** The integration will handle errors – e.g., if the OpenAI API returns an error or times out, we catch it. We might implement a simple retry logic for transient network issues. If the error persists, the module will return a failure state that the API route can convey to the frontend.
- **Abstraction Benefits:** By centralizing GPT-related logic, we can easily adjust prompts or model parameters in one place. For instance, if we find the summary is too verbose, we can tweak the summary prompt template without touching other parts of the code. Similarly, if a future version upgrades to a different model, we primarily update this module.

Overall, this layer transforms raw text into structured insights. It's designed to follow best practices in prompt design to get reliable outputs (next section) and to handle necessary parsing and error cases. This abstraction makes it easier to maintain and test the AI integration, as we can simulate inputs and verify the module's outputs in isolation.

## 7. Prompt Engineering Best Practices

Crafting effective prompts is crucial for getting useful and reliable outputs from GPT-4. We will adhere to prompt engineering best practices to ensure the model understands the task and produces outputs in the desired format. Below are the key guidelines we'll follow (for each type of GPT call), aligned with OpenAI's recommendations:

- **Clear Instructions:** Begin each prompt by clearly stating what we want the model to do. Ambiguity can lead to irrelevant or confused answers. For example, "**Summarize the following medical document focusing on key findings and patient recommendations**" is clearer than just "Summarize this."
- **Use Delimiters for Context:** We will separate the instruction and the document text using delimiters like triple quotes (`"""`). This prevents the model from mistaking the document text as part of the instructions. For example:
  _Instruction:_ Summarize the following document…
  _Document:_

  ```
  """
  [document text here]
  """
  ```

- **Provide Examples (Few-shot prompting):** If a task benefits from an example (e.g., the format of a timeline), we may include a brief example in the prompt. For instance, "List events with dates. e.g., 2020-01-01: Patient visited clinic." This can guide GPT-4 on the desired output structure. However, since each API call has cost and context length implications, we will use examples sparingly and only if zero-shot prompts aren't sufficient.
- **Set Role/Tone via System Message:** We will use the system message to influence the style. For example, setting the role: _"You are a compassionate medical assistant AI that explains medical information in simple terms."_ This ensures the tone is friendly, not too clinical nor too casual. It also helps avoid alarming language unless necessary for alerts.
- **Format Specifications:** When we need structured output (like JSON or bullet points), we will explicitly outline the format in the prompt. For example, _"Provide the timeline as an array of JSON objects with 'date' and 'event' fields."_ or _"List the insights as bullet points."_ Providing the desired format reduces guesswork for the model.
- **Avoid Open-Endedness for Factual Extraction:** For tasks like extracting timeline events or specific values, we will ask direct questions. Instead of, "What happened in the document?", we'll prompt: _"Identify all dates in the document and describe what happened on those dates."_ This focuses the model's attention.
- **Iterative Refinement:** We'll test prompts with various sample documents during development. If we observe errors or undesired output (e.g., the model missing an insight or including irrelevant info), we will refine the phrasing. Prompt engineering is an iterative process; we expect to tweak prompts as we gather more examples of the model's outputs.

By following these best practices, we increase the reliability of GPT-4's outputs for our use case. The goal is to have outputs that need minimal or no manual correction to be useful to the user. The next section will give concrete examples of prompts adhering to these guidelines.

## 8. Sample Prompts for AI Tasks

Below are sample prompt designs for the different AI tasks in MediInsight. These illustrate how we might phrase our requests to GPT-4:

**A. Document Summarization Prompt**
_System Message:_ You are a medical assistant AI that summarizes medical documents for patients in clear, simple language.
_User Prompt:_

```
Summarize the following medical document for the patient, focusing on the main findings and any recommendations from the doctor.

"""[DOCUMENT_TEXT]"""
```

_Explanation:_ We instruct the model to focus on main findings and recommendations, ensuring the summary is patient-friendly. The document text is enclosed in triple quotes to clearly delimit it as context.

**B. Key Insights Extraction Prompt**
_System Message:_ You are a medical analyst AI extracting key insights from a medical report.
_User Prompt:_

```
List the key medical insights from the following document. Include important abnormal results, diagnoses, or recommendations as bullet points.

"""[DOCUMENT_TEXT]"""
```

_Explanation:_ The prompt explicitly asks for a bullet-point list of important insights (abnormal results, diagnoses, recommendations). This guides GPT-4 to output a concise list of critical points.

**C. Medical Timeline Extraction Prompt**
_System Message:_ You are a medical assistant AI that creates a chronological timeline of events from a document.
_User Prompt:_

```
From the following text, extract all dates and describe the medical event that happened on each date. Present the events in chronological order.

"""[DOCUMENT_TEXT]"""
```

_Explanation:_ We ask for dates and corresponding events, which should yield a structured timeline. The instruction to present in chronological order helps ensure the events are sorted by date.

_(Similar prompt patterns would be created for generating the Health Card overview and Suggested Questions, each with specific instructions.)_

These prompt examples demonstrate our approach: clear task instructions, separation of context, and requested formatting. We will test and adjust these prompts as needed to ensure GPT-4 provides the quality of output we expect.

## 9. Example JSON Data for Documents and Outputs

To further clarify the data structures, here are example JSON objects representing an analyzed document and the AI-generated outputs. These examples show how information might be structured in our system (both in Firestore and through the API responses):

**Example 1: An Analyzed Lab Report**
Imagine a user uploads a blood test report PDF. After processing, the system might produce the following data:

```json
{
  "id": "doc789", // Document ID (Firestore document ID)
  "userId": "UID12345",
  "fileName": "BloodTest_March2025.pdf",
  "filePath": "users/UID12345/documents/doc789.pdf",
  "uploadedAt": "2025-03-20T10:15:00Z",
  "summary": "The blood test from March 2025 shows that the patient has elevated cholesterol and slightly high blood sugar, but other parameters are within normal range. The doctor notes that the patient is overweight, which may be contributing to these results. It's recommended that the patient improve diet and exercise, and a follow-up test is suggested in 3 months.",
  "insights": [
    "Total cholesterol is high at 250 mg/dL (normal < 200 mg/dL).",
    "Fasting blood glucose is 110 mg/dL, which is slightly above normal (potential prediabetes).",
    "The patient's thyroid function (TSH) is normal.",
    "Doctor recommends dietary changes and exercise to address weight and cholesterol."
  ],
  "healthCard": {
    "status": "Generally good health, but with high cholesterol and early signs of high blood sugar.",
    "alerts": [
      "High cholesterol level (250 mg/dL)",
      "Elevated fasting blood sugar"
    ],
    "suggestions": [
      "Adopt a low-cholesterol diet and regular exercise",
      "Recheck blood tests in 3 months"
    ]
  },
  "timeline": [
    {
      "date": "2025-03-15",
      "event": "Blood sample taken for routine testing."
    },
    {
      "date": "2025-03-20",
      "event": "Results reported: high cholesterol and elevated blood sugar identified."
    }
  ],
  "questions": [
    "What diet changes can help lower my cholesterol effectively?",
    "Does the blood sugar level mean I am diabetic or at risk?",
    "Should I start any medication for cholesterol, or can it be managed with lifestyle changes?"
  ]
}
```

In this JSON:

- `summary` is a readable paragraph summarizing the report.
- `insights` list out important details and abnormal findings.
- `healthCard` provides a mini-overview (status, alerts, suggestions).
- `timeline` has events with dates (in this case, the test date and the result date).
- `questions` has a few suggested questions the patient might ask.

This JSON would be stored in Firestore (without the `id` field, since Firestore uses the document ID as the key). The API's `AnalyzeResponse` would look very similar (it may exclude `userId`, which is internal).

**Example 2: A Doctor's Visit Note (shorter example)**

```json
{
  "id": "doc456",
  "userId": "UID12345",
  "fileName": "DoctorVisit_Feb2025.jpg",
  "filePath": "users/UID12345/documents/doc456.jpg",
  "uploadedAt": "2025-02-10T08:00:00Z",
  "summary": "Dr. Lee's notes from the Feb 2025 visit indicate that the patient's blood pressure is not well-controlled and the medication dosage was adjusted. The patient complained of headaches, likely due to high blood pressure. Dr. Lee advised strict adherence to medication and lifestyle changes. A follow-up appointment was scheduled after one month.",
  "insights": [
    "Blood pressure was 150/95, which is above the target (< 130/80 for treated hypertension).",
    "Patient experiencing headaches, likely related to high blood pressure.",
    "Medication (Lisinopril) dosage increased from 10mg to 20mg daily.",
    "Strong advice given to reduce salt intake and exercise regularly."
  ],
  "healthCard": {
    "status": "Blood pressure is high; medication dosage increased for better control.",
    "alerts": ["High blood pressure reading (150/95)"],
    "suggestions": [
      "Take the new medication dose daily as prescribed",
      "Reduce salt intake and maintain exercise",
      "Follow-up in 1 month for BP check"
    ]
  },
  "timeline": [
    {
      "date": "2025-02-09",
      "event": "Patient had headaches; BP measured at home was high."
    },
    {
      "date": "2025-02-10",
      "event": "Clinic visit: BP 150/95, medication dose increased, lifestyle changes reinforced."
    },
    {
      "date": "2025-03-10",
      "event": "Follow-up appointment scheduled to recheck blood pressure."
    }
  ],
  "questions": [
    "What could be causing my blood pressure to stay high despite medication?",
    "Are there side effects with the higher dose of Lisinopril I should watch for?",
    "How soon should I expect to see improvements in my blood pressure with these changes?"
  ]
}
```

These examples demonstrate how data flows from unstructured text to structured insights. In development, we'll use similar dummy data to ensure the frontend components (like `DocumentSummary`, `HealthCard`, `Timeline`) render correctly.

## 10. Development Best Practices

To ensure a maintainable and high-quality codebase for MediInsight, we will incorporate several development best practices and tools from the start:

- **TypeScript & Type Safety:** We will use TypeScript end-to-end (as specified). The `tsconfig.json` will enable strict mode (`"strict": true`) and other recommended flags to catch errors and enforce good typing. All functions, especially for API handlers and data models, will have explicit types. This prevents many classes of bugs and makes the code self-documenting.
- **ESLint and Prettier:** We will set up ESLint for linting our code, extending recommended configs for React, Next.js, and TypeScript. Prettier will be used for code formatting. Having a consistent style makes collaboration easier and code more readable. For example, we'll enforce single quotes, semi-colons, spacing rules, etc. These tools will catch issues like unused variables, inconsistent imports, and potential bugs. (We can use Next.js's default ESLint setup as a starting point.)
- **Husky Hooks:** To maintain code quality, we'll use Husky to run Git hooks. For instance, a pre-commit hook can run `eslint --fix` and `prettier --write` on staged files, as well as run tests (if any). This way, we ensure that every commit meets our linting/formatting standards. This automated enforcement prevents "it works on my machine" scenarios and keeps the repository clean. Developers can't accidentally commit code that fails lint checks.
- **Module Aliases and Project Structure Discipline:** We might configure path aliases (e.g., `@/components/*`, `@/lib/*`) for cleaner imports. We will avoid very long relative import paths. Next.js and TypeScript allow setting these in `jsconfig.json/tsconfig.json`. The folder structure defined earlier will be followed to keep concerns separated (UI vs logic vs config).
- **UI Design System Consistency (shadcn/ui):** We will adopt **shadcn/ui** (a component library built on Radix UI and Tailwind CSS) as the basis for all UI components. This ensures a consistent look and feel across the application. Common components (like buttons, modals, form inputs) will use shadcn/ui primitives, which come with accessible and theme-consistent styles. Any custom components should follow shadcn/ui's conventions in styling and structure to maintain a cohesive UI throughout the app.
- **Git Best Practices:** We'll use a Git branching strategy suitable for a small team (feature branches, pull requests for review, etc.). Even for an MVP, code review by peers (or at least by oneself through a PR) can catch issues. We should write clear commit messages (e.g., "Add OCR text extraction function" rather than "stuff").
- **Error Handling & Logging:** We will create a unified error handling approach:

  - On the **frontend**, use error boundaries or conditional rendering to handle failures (e.g., if the analysis API returns an error, show a message like "Analysis failed due to a server error, please try again.").
  - On the **backend**, catch exceptions in API routes. We can define a consistent error response format, e.g., `{ error: true, message: "..." }` with appropriate HTTP status codes. This will allow the frontend to distinguish errors easily.
  - Logging errors is important; we may integrate with a logging service or just use `console.error` on Vercel (visible in function logs) for debugging. Sensitive info (like stack traces or API keys) won't be sent to users, just a generic error message.
  - Abstract common logic – for instance, verifying a Firebase ID token could be a middleware function so each API route isn't cluttered with it.

- **Performance and UX Considerations:**

  - Use loading spinners or skeletons while waiting for analysis results (to keep users informed that work is in progress).
  - Possibly use web workers or Next.js API route streaming if the analysis is slow, but for MVP we can simply show a loading state and wait for the result.
  - For the frontend, use React best practices: functional components, Hooks for state, and minimize re-renders (e.g., consider context segmentation so that heavy data doesn't cause re-renders of the entire app).
  - Use Next.js dynamic imports for large libraries (e.g., if Tesseract or PDF parsing libraries are big, ensure they are only loaded server-side or when needed) to keep the client bundle lean.

- **Security:**

  - Keep all secret keys in environment variables. On Vercel, we'll use the dashboard to set `OPENAI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS` (for Vision API), etc. Locally, we use a `.env.local` file (which is git-ignored). We will never commit secrets to the repo.
  - Enforce Firebase Security Rules: Write rules for Firestore such that each user's document data can only be read/written by that user. Similarly, Storage rules will ensure users can upload/download only their own files.
  - Sanitize any data coming from OCR before using it in prompts (this is less about security and more about avoiding prompt injection or handling odd tokens – not a huge risk in our scenario, but something to be mindful of when incorporating user-provided text into AI prompts).

- **Testing:** Given the time constraints of an MVP, extensive automated testing might be limited, but we plan to at least:

  - Do manual end-to-end testing: upload various types of docs (lab report, doctor note) and verify outputs make sense.
  - Write unit tests for pure functions (if we have any non-trivial logic in text processing, e.g., a function that normalizes OCR text or parses dates, it should have tests).
  - Potentially use a testing library for React (React Testing Library) to test that components render correctly given props (e.g., the `HealthCard` displays alerts in red if any). This ensures our presentation logic is correct.

- **DevOps and Deployment:** Using Vercel for deployment gives us CI/CD out of the box (each push can deploy). We will configure the project on Vercel to deploy the main branch to production and use preview deployments for PRs. We'll monitor build times and bundle sizes – Next.js and Vercel provide analytics. We should also set up error monitoring (using Vercel's logs or adding Sentry for front-end/back-end).
- **Maintaining Code Quality:** As the project grows beyond MVP, having these practices in place means new contributors can follow the established patterns. We'll include a **README.md** in the repo explaining how to set up the environment, run the dev server, and obtain required API keys, etc. Good documentation is also a best practice.

By following these development best practices, we aim to create a robust MVP that is not only functional but also maintainable and extensible. The emphasis on linting, formatting, and structured code will reduce bugs and technical debt, allowing the team to focus on feature development and refinement of the AI prompts/outputs.

## Sources

- **Firebase Next.js Codelab:** Demonstrated using Firebase Auth for Google login and storing uploaded files' URLs in Firestore, which aligns with our approach. _(Source: [Integrate Firebase with a Next.js app – Firebase Codelab](https://firebase.google.com/codelabs/firebase-nextjs))_
- **OpenAI Prompt Engineering Guidelines:** Reinforced our strategy of clear, specific instructions and formatted prompts, as well as using low temperature for factual consistency. _(Source: [OpenAI Help Center – Best practices for prompt engineering](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api))_
- **Google Cloud Vision Documentation:** Confirmed that Vision API can OCR PDFs in Cloud Storage (for our OCR design). _(Source: [Google Cloud Vision API Docs – Detect text in files (PDF/TIFF)](https://cloud.google.com/vision/docs/pdf))_
- **Next.js App Router Docs:** Noted the use of `app/api/route.ts` for defining API endpoints in the new folder structure, which we utilize for our API design. _(Source: [Next.js Documentation – Project Structure](https://nextjs.org/docs/app/getting-started/project-structure))_
