# 보안 정책 (Security)

## 1. 환경 변수 및 시크릿 관리
- API 키(Gemini API 등), DB 비밀번호, Storage 인증 정보는 코드에 하드코딩하지 않습니다.
- 로컬 개발 시 `.env.example`을 참고하여 `.env` 파일에만 저장하며, 이 파일은 Git에 커밋되지 않도록 `.gitignore`에 등록합니다.

## 2. Web Safety & API 보안
- **CORS 및 csrf 방어**: Next.js App Router의 기본 보안 사항을 준수하며 API Route 보호.
- **입력값 검증**: `zod` 라이브러리를 통해 클라이언트에서 서버로 들어오는 모든 요청(Job Create 등)을 검증하여 Injection 공격을 예방합니다.

## 3. 개인정보 보호 (PII)
- 시스템에 저장되는 사용자 입력 데이터 및 생성된 보고서는 민감한 개인정보를 포함하지 않도록 프롬프트 수준에서 제어(생성 내용 모니터링)합니다.
- 서드파티 매크로 자동 제출을 막고, 최종 제출은 사용자가 수동으로 진행하도록 강제합니다.

## 4. Rate Limiting
- 무분별한 Job 생성 어뷰징 방지를 위해 유저/IP 단위로 API 호출 횟수를 제한(Rate Limit)합니다.
