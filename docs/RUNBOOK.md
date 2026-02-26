# Runbook

## 1. Prerequisites
- Node.js 18+ and pnpm installed
- SQLite for local dev
- API Keys ready:
  - `GEMINI_API_KEY`: Get from Google AI Studio.

## 2. Local Setup
1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Initialize the Local SQLite Database:
   ```bash
   cd packages/shared
   pnpm dlx prisma db push
   pnpm dlx prisma generate
   cd ../..
   ```

3. Setup environment variables:
   - Copy `.env.example` to `.env` in the root (contains `DATABASE_URL` and `GEMINI_API_KEY`).
   - Copy `.env.example` to `packages/shared/.env` (contains `DATABASE_URL`).
   - Copy `.env` to `apps/worker/.env` to ensure the worker loads the Gemini API key.

> [!IMPORTANT] 
> Local vs. Production Env Checklist
> - **Production Check**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` MUST be set for the Auth API to successfully initialize Google login. 
> - **Toss Payments**: Real payments require `TOSS_SECRET_KEY` in production. If missing when processing `/confirm`, the API will return a 500 configuration error.

## Auth Troubleshooting
- **증상**: 로그인 클릭 시 500 에러나 'Missing Google OAuth credentials' 에러 반환. 로그인 외 기능(무료 Job 등)은 정상적으로 접속.
- **점검 순서 (체크리스트)**:
  1. `.env` 파일 내에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 존재 여부 확인.
  2. 개발(Development) 모드라면 `/login` UI 하단에 경고 메시지가 뜨는지 확인.
  3. 콘솔을 열고 `[Auth] CRITICAL:` 로그가 발생했는지 파악하여 누락된 키 보충.

## 3. Running Services Locally
Start both the Next.js Frontend and the Node Worker simultaneously using the workspace root command:

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **Worker**: Logs will appear in the terminal (`[Worker] Polling for jobs...`)
- **PDF Storage**: Rendered mock PDFs will be stored in `/.storage` and streamed via `/api/jobs/download?key=...`.

## 4. Deploying Web to Vercel
1. Push the repository to GitHub.
2. In Vercel Dashboard, import the repository.
3. Set the **Root Directory** to `apps/web`.
4. The Build Command and Output Directory will be automatically detected for Next.js.
5. Add Environment Variables:
   - `DATABASE_URL` (Point to a production Postgres like Supabase or Neon, NOT SQLite).
6. Click Deploy.

## 5. Deploying Worker (Docker / Cloud Run)
1. Build the Docker container from the root directory:
   ```bash
   docker build -t riro-worker -f apps/worker/Dockerfile .
   ```
2. Push to Google Container Registry or Artifact Registry.
3. Deploy to Cloud Run (or AWS Fargate) ensuring it's set up as a continuous background process, not a web service (since it polls).
   - Ensure `DATABASE_URL` and `GEMINI_API_KEY` are provided as environment variables to the container.
