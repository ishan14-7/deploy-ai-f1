# Deploy AI

An F1 session explorer. Pick a season, Grand Prix, session and driver, and Deploy AI loads that lap's real telemetry, draws it on the circuit map, and shows how a smarter battery deployment strategy compares with a naive one.

**Live:** [deploy-ai-f1.vercel.app](https://deploy-ai-f1.vercel.app)

## What it does

- **Real telemetry.** Speed, throttle, brake, gear, RPM and car position for any lap, pulled from the [OpenF1 API](https://openf1.org).
- **Track map.** The lap is drawn on the circuit from the car's position data, split into straights, corners, braking and acceleration zones.
- **Energy strategy.** Compares a naive "deploy on full throttle" approach with an optimised deploy, hold and harvest plan, and flags where the naive one runs the battery flat.
- **Engineer report.** A race-engineer style summary of the lap and the strategy difference.

The strategy model is simulated in the browser for now (`src/data/mockStrategy.ts`). `src/config/dataSource.ts` has a switch to point it at a real strategy API instead.

## Stack

| Part | Tech |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, Recharts |
| API | Python, FastAPI (`api/index.py`) |
| Data | OpenF1 API, with a generated sample lap as a fallback |
| Hosting | Vercel (static frontend plus a Python serverless function) |

## Running locally

You need Node.js and Python 3.

```bash
# API on http://localhost:8000
cd api
pip install -r requirements.txt
uvicorn index:app --reload --port 8000

# Frontend on http://localhost:5173 (in a second terminal)
npm install
npm run dev
```

In development the frontend calls the API on port 8000. In production both are served from the same Vercel domain, and `vercel.json` routes `/api/*` to the Python function.

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/lap?year=&event=&session=&driver=&lap_number=` | Telemetry, track segments and lap metadata. `lap_number` is optional and defaults to the fastest lap. |
| `GET /api/lap/sample` | A generated sample lap, for when live data can't be loaded. |
