# Project structure

Applywise is a static browser app with no package dependencies or compilation step. The browser app lives in `frontend/`; its HTML remains a single file so it can still be opened directly without fetching HTML fragments or running a build.

| File | Purpose |
| --- | --- |
| `frontend/index.html` | Page structure, navigation, application and skills forms, and the three workspace views |
| `frontend/styles.css` | Visual design, responsive layout, and reduced-motion handling |
| `frontend/app.js` | Application and skills storage, fit calculation, rendering, navigation, form validation, and event handling |
| `README.md` | Project introduction, quick-start instructions, and documentation entry point |
| `docs/` | User, feature, privacy, and project guides |

## Run locally

Open `frontend/index.html` directly in a browser. If your browser restricts local file behavior, serve the project folder with any static HTTP server and open its local URL instead.

## Stored application fields

Each application record includes an ID, company, role, location, work style, date applied, status, follow-up date, salary, job description, notes, URL, and created/updated timestamps. The fields are stored as JSON in local storage; there is no database or backend API.
