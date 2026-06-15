# LectureHub

Vercel + Supabase 기반 강의 사이트입니다.

## 기능

- **플로팅 채팅** — 우측 하단에 항상 표시, 강사만 작성 (비밀번호 + 세션)
- **채팅 복사** — 수강생은 전체 내용 복사 가능
- **자료실** — Supabase Storage에 파일 저장, 다운로드 제공
- **질문게시판** — 익명 작성, 강사가 해결 여부 체크

## 시작하기

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. **Storage** → 새 버킷 `materials` 생성 (Private 권장)
3. **Settings → Database**에서 Connection string 복사
   - `DATABASE_URL`: Transaction pooler (포트 6543)
   - `DIRECT_URL`: Direct connection (포트 5432)
4. **Settings → API**에서 URL, anon key, service_role key 복사

### 2. 환경 변수

```bash
cp .env.example .env
```

`.env` 파일을 Supabase·강사 비밀번호 값으로 채웁니다.

### 3. DB 마이그레이션

```bash
npm install
npx prisma migrate dev --name init
```

### 4. 로컬 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## Vercel 배포

1. GitHub에 push
2. Vercel에서 프로젝트 import
3. Environment Variables에 `.env.example` 항목 모두 등록
4. Deploy
5. 배포 후 로컬 또는 CI에서:

```bash
npx prisma migrate deploy
```

## 강사 사용법

1. 상단 **강사 로그인** 클릭
2. `INSTRUCTOR_PASSWORD` 입력 (한 번만, 세션 유지)
3. 채팅 작성, 자료 업로드, 질문 해결 처리 가능

## 기술 스택

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Prisma + Supabase PostgreSQL
- Supabase Storage
- iron-session
