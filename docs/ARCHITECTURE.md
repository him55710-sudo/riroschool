# 시스템 아키텍처 (Architecture)

## 1. 개요
모노레포(pnpm workspace) 구조로 프론트엔드 Web App과 백엔드 Worker 서비스가 분리되어 있습니다.

## 2. 구성 요소
- **Frontend (Next.js App Router)**: UI 렌더링, 상태 관리, Job 생성 API 엔드포인트 및 상태 폴링 제공. Tailwind CSS를 통한 스타일링.
- **Worker (Node.js)**: 긴 시간이 소요되는 AI 보고서 생성 및 PDF 렌더링 작업을 별도의 큐(Queue)에서 비동기적으로 처리. 
  - Playwright를 사용해 HTML을 PDF로 렌더링.
- **Database (PostgreSQL / SQLite)**: Prisma ORM을 통해 Job 상태 및 로그 관리. 로컬에서는 SQLite, 운영에서는 PostgreSQL 사용.
- **Storage**: 생성된 PDF 파일을 저장 (로컬 환경에서는 FS, 운영에서는 S3 호환 스토리지) 후 Signed URL 반환.
- **AI Model**: 서버사이드에서 Gemini API (`@google/generative-ai`)를 직접 호출하여 리포트 내용 생성.

## 3. 데이터 흐름
1. 사용자가 Web에서 주제를 입력하고 생성 요청(Job)을 보냄.
2. Next.js Route Handler가 DB에 PENDING 상태의 Job을 생성.
3. Node Worker가 주기적으로 폴링(Polling)하여 PENDING Job을 가져옴.
4. Worker가 Gemini API로 텍스트 생성 -> HTML 변환 -> Playwright로 PDF 렌더링.
5. PDF를 Storage에 업로드하고 DB의 Job 상태를 COMPLETED로 변경 및 URL 업데이트.
6. Web에서 상태를 확인하고 사용자에게 결과 반환.
