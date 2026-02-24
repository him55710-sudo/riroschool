# 배포 가이드 (Deployment)

## 1. Frontend (Web App)
- **Vercel**에 배포 최적화.
- GitHub 리포지토리 연동 후, Vercel 대시보드에서 `apps/web`을 루트 디렉토리로 설정하여 배포합니다.
- 환경변수(`.env`)에 DB 접속 정보 및 API 연동 키를 설정합니다.

## 2. Worker (Node.js)
- **컨테이너 기반 배포 (Cloud Run 권장)**
- 장시간 실행되는 작업이므로 Serverless Web 환경(Vercel)의 타임아웃 제한(보통 10~60초)을 우회하기 위해 별도의 컨테이너로 배포합니다.
- `apps/worker` 내에 Dockerfile을 구성하여 빌드한 후, GCP Cloud Run이나 AWS ECS 등에 배포합니다.

### Worker Dockerfile 예시
```dockerfile
FROM mcr.microsoft.com/playwright:v1.42.0-jammy
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

## 3. Database & Storage
- **운영 DB**: Supabase, PlanetScale, Neon 등 Serverless PostgreSQL 사용 권장.
- **Storage**: AWS S3 또는 Cloudflare R2를 사용해 업로드 후 Signed URL 제공.
