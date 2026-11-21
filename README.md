# FACEPULSE Frontend (React + Vite)
Talks to your existing Flask `app.py` through `/api/*` (no backend changes needed).

## Run locally
1. Start the backend: `python app.py` (port 5000)
2. `npm install` then `npm run dev` -> http://localhost:5173 (Vite proxies /api to Flask)

## Deploy on Vercel
1. Your Flask backend must be online over **HTTPS** (see DEPLOY.md in the backend project).
2. Edit `vercel.json`: replace `YOUR-BACKEND-DOMAIN` with your backend's domain.
   Vercel forwards `/api/*` to it, so the browser sees one site: cookies work and no CORS setup is needed.
3. Push to GitHub and import the repo in Vercel (framework: Vite, build `npm run build`, output `dist`), or run `npx vercel`.
4. On the backend set `COOKIE_SECURE=1`.

Pages: / (login) · /dashboard (admin+faculty) · /manage (admin) · /live (faculty) · /enroll (admin, student) · /student
