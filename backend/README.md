# EcoSort backend (Flask)

This backend serves the frontend page and provides `/api/sort` so the browser never talks to Anthropic directly.

## Setup

1. Create an environment file:

- Copy `.env.example` to `.env`
- Set `ANTHROPIC_API_KEY=...`

2. Install dependencies:

```bash
py -m pip install -r requirements.txt
```

3. Run the server:

```bash
py app.py
```

Then open `http://127.0.0.1:5000/`.

## Endpoints

- `GET /` serves `RTRP/ai garbage sort assistant.html`
- `GET /api/health` basic health (checks if API key is configured)
- `POST /api/sort` body: `{ "query": "...", "area": "..." }`

