# 개발 계획 (PLAN)

## Step 1: Free 티어 생성 파이프라인 구축 (현재 단계)
- [x] 모노레포 초기화 (pnpm workspace)
- [x] 기본 구조 설정 (apps/web, apps/worker, packages/shared)
- [x] 문서화 작업 완료 (PRD, ARCHITECTURE, DEPLOYMENT, SECURITY, PLAN)
- [ ] DB 스키마 설계 및 Prisma 설정 (로컬 SQLite)
- [ ] Next.js API 구성 (Mock Job 생성 API)
- [ ] Node Worker 스크립트 작성 (Fake 폴링 및 완료 처리 로직)
- [ ] "Hello Job" 파이프라인 엔드투엔드 테스트 완료
  - **인수 조건**: 웹에서 Job 생성 시 DB에 저장되고, Worker가 이를 감지해 COMPLETED 상태로 변경하며 웹에서 그 상태를 확인할 수 있어야 함.

## Step 2: Paywall 및 결제 연동 도입
- [ ] 결제 모듈(Toss Payments / Stripe 등) 연동
- [ ] 사용자 엔티티 확장 (크레딧, 구독 상태, 역할 등 추가)
- [ ] 티어별 모델 제어 로직 (PAID_TIER_1, PAID_TIER_2 페이지 분량 제어)
- [ ] 결제 후 크레딧 차감 테스트
  - **인수 조건**: FREE 티어 횟수 초과 또는 PAID 요청 시 정상적으로 결제/크레딧 차감이 이루어져야 함.

## Step 3: 리포트 품질 및 디자인 개선
- [ ] Gemini 프롬프트 고도화 (인용구 작성, 깊이 있는 학술적 구성)
- [ ] HTML 레이아웃 디자인 폴리싱 (Tailwind CSS 기반 전문 리포트 양식 적용)
- [ ] 차트 및 다이어그램 추가 생성 (Mermaid/Chart.js 렌더링)
- [ ] 관련 자료 웹 검색 파이프라인 연계 테스트
  - **인수 조건**: 결과물이 10~30페이지 분량을 실제로 만족하며 레이아웃이 깨지지 않아야 함.
