# GraamSetu Backend (Node.js + Express + Firebase + Firestore)

## Stack
- Node.js v20 LTS
- Express REST API
- Firebase Authentication (OTP-ready flow)
- Firebase Firestore
- Firebase Storage
- Upstash Redis cache
- JWT security
- OpenAPI docs (`/docs`)

## Setup
1. Copy `.env.example` to `.env`.
2. Fill Firebase and API credentials.
3. Install dependencies:
   - `cd backend`
   - `npm install`
4. Run server:
   - `npm run dev`

## API base
- Local: `http://localhost:8080/api`
- Health: `http://localhost:8080/health`
- Docs: `http://localhost:8080/docs`

## Deployment
### Railway
- Set root directory to `backend`
- Start command: `npm start`
- Add all `.env` variables in Railway dashboard

### Vercel
- Use Node server deployment for `backend/src/server.js`
- Add env variables in Vercel project settings

## Consent and security
- JWT required for protected APIs.
- Financial-sensitive routes require headers:
  - `x-session-id: <unique-session-id>`
  - `x-financial-consent: granted`

## Important integration note
Frontend should call:
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
Then include JWT in `Authorization: Bearer <token>` for protected APIs.
