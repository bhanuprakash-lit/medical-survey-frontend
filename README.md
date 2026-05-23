# Medical Survey Frontend

Mobile-first React frontend for the Medical AI Survey application. It supports surveyor sign-in, store capture, protected survey questions, local draft saving, final submission, and an admin submissions view.

## Tech Stack

- React
- Vite
- Tailwind CSS

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Default local URL:

```text
http://127.0.0.1:5173
```

## Backend Proxy

The Vite dev server proxies API calls to the FastAPI backend:

```text
http://localhost:8000
```

Configured endpoints are in:

```text
src/config/api.js
```

## Main Flow

1. Surveyor signs in with phone number and password.
2. First-time surveyors can set their password during initial sign-in.
3. Store details are captured.
4. A survey session is started.
5. Protected questions are loaded with the auth token.
6. Answers are saved locally as a draft while filling the survey.
7. Final submission is sent to the backend.

## Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Notes

- `node_modules`, `dist`, local logs, and local environment files are ignored.
- The UI is designed for compact mobile screens and avoids page-level horizontal scrolling.
