# 교토 여가 가이드 (Kyoto Leisure Guide) -- 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙과 절대 하면 안 되는 것.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 2026년 가장 넓은 생태계, AI 코딩 도구 호환성 최고, SSR/SSG 지원으로 SEO와 성능 확보 |
| DB/백엔드 | Supabase (PostgreSQL) | 인증, DB, 스토리지, 실시간 구독을 하나의 서비스로 해결. 무료 티어로 MVP 충분 |
| 배포 | Vercel (Free) | Next.js 공식 배포 플랫폼. git push만으로 자동 배포. 무료 티어 제공 |
| 인증 | Supabase Auth (Google OAuth) | 소셜 로그인 설정이 간편. RLS와 자연스럽게 연동 |
| 스타일링 | Tailwind CSS 4 | 모바일 우선 반응형 디자인에 최적. 클래스 기반으로 AI 코딩과 궁합 좋음 |
| 지도 | Leaflet + OpenStreetMap | 무료 오픈소스 지도. Google Maps와 달리 API 키 비용 없음 |
| 이미지 저장 | Supabase Storage | 장소/행사 이미지를 Supabase Storage에 업로드. 무료 티어 1GB 제공 |
| 아이콘 | Lucide React | 경량 아이콘 라이브러리. 직관적인 UI 구성에 활용 |

---

## 프로젝트 구조

```
kyoto-leisure-guide/
├── src/
│   ├── app/                  # 페이지 (App Router)
│   │   ├── layout.tsx        # 공통 레이아웃
│   │   ├── page.tsx          # 홈 (추천 장소 + 다가올 행사)
│   │   ├── places/           # 장소 목록 + 상세
│   │   ├── events/           # 행사 캘린더 + 상세
│   │   ├── bus/              # 버스 노선 + 지도
│   │   ├── bookmarks/        # 즐겨찾기 모아보기
│   │   └── auth/             # 로그인/콜백
│   ├── components/           # 재사용 가능한 UI 조각
│   │   ├── PlaceCard.tsx     # 장소 카드
│   │   ├── EventCard.tsx     # 행사 카드
│   │   ├── BusMap.tsx        # 버스 지도 (Leaflet)
│   │   ├── CategoryFilter.tsx # 카테고리 필터 칩
│   │   └── BottomNav.tsx     # 하단 네비게이션 바
│   ├── lib/                  # 유틸리티, DB 연결
│   │   ├── supabase/
│   │   │   ├── client.ts     # 브라우저 Supabase 클라이언트
│   │   │   └── server.ts     # 서버 Supabase 클라이언트
│   │   └── utils.ts          # 공통 유틸리티
│   └── types/                # TypeScript 타입 정의
│       └── database.ts       # Supabase 자동 생성 타입
├── public/                   # 정적 파일 (이미지, 아이콘)
├── .env.local                # 환경변수 (Supabase 키 등)
├── tailwind.config.ts        # Tailwind 설정
├── next.config.ts            # Next.js 설정
└── package.json              # 의존성 목록
```

---

## 절대 하지 마 (DO NOT)

> AI에게 코드를 시킬 때 이 목록을 반드시 함께 공유하세요.

- [ ] API 키나 비밀번호를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] 기존 DB 스키마(Supabase 테이블)를 임의로 변경하지 마
- [ ] 테스트 없이 배포하지 마 (최소 `npm run build` 성공 확인)
- [ ] 목업/하드코딩 데이터로 완성이라고 하지 마 (실제 Supabase 연결)
- [ ] package.json의 기존 의존성 버전을 변경하지 마
- [ ] `use client`를 모든 컴포넌트에 무분별하게 붙이지 마 (서버 컴포넌트 우선)
- [ ] Leaflet을 SSR 환경에서 직접 import하지 마 (`dynamic import` 사용)
- [ ] Supabase RLS(Row Level Security) 비활성화하지 마
- [ ] 사용자 입력값을 검증 없이 DB에 넣지 마 (SQL injection 방지)
- [ ] 이미지 URL을 하드코딩하지 마 (Supabase Storage 또는 환경변수 활용)

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장
- [ ] 에러가 발생하면 사용자에게 친절한 메시지 표시 (일본어/영어 병기)
- [ ] 모바일에서도 사용 가능한 반응형 디자인 (모바일 우선)
- [ ] Supabase 쿼리에 적절한 인덱스와 RLS 정책 적용
- [ ] 지도 컴포넌트는 `next/dynamic`으로 클라이언트 사이드에서만 로드
- [ ] TypeScript strict 모드 사용
- [ ] 장소/행사 데이터에 일본어 원문(name_ja)을 함께 저장
- [ ] 이미지는 next/image로 최적화하여 표시

---

## 테스트 방법

```bash
# 로컬 실행
npm run dev

# 타입 체크
npx tsc --noEmit

# 빌드 확인 (배포 전 필수)
npm run build

# Lint 확인
npm run lint
```

---

## 배포 방법

### Vercel 배포 (추천)
1. GitHub 저장소에 코드 push
2. Vercel에서 프로젝트 import (https://vercel.com/new)
3. 환경변수 설정 (Settings → Environment Variables)
4. 자동 배포 완료 (이후 push할 때마다 자동 배포)

### 환경변수 설정
Vercel 대시보드 → Settings → Environment Variables에 아래 변수 추가

---

## 환경변수

| 변수명 | 설명 | 어디서 발급 |
|--------|------|------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL | Supabase 대시보드 → Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 공개 키 | Supabase 대시보드 → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 서비스 키 (서버 전용) | Supabase 대시보드 → Settings → API |

> .env.local 파일에 저장. 절대 GitHub에 올리지 마세요.
> `.gitignore`에 `.env.local`이 포함되어 있는지 반드시 확인하세요.

---

## Supabase 테이블 생성 SQL

```sql
-- 카테고리
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT
);

-- 장소
CREATE TABLE places (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  name_ja TEXT,
  category_id TEXT REFERENCES categories(id),
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 3),
  opening_hours TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 행사
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  place_id TEXT REFERENCES places(id),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 버스 노선
CREATE TABLE bus_routes (
  id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  color TEXT
);

-- 버스 정류장
CREATE TABLE bus_stops (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  route_ids TEXT[] NOT NULL DEFAULT '{}'
);

-- 즐겨찾기
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('place', 'event')),
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- RLS 활성화
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 즐겨찾기: 본인 것만 CRUD 가능
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 장소/행사/버스: 누구나 읽기 가능
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read places" ON places FOR SELECT USING (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bus_routes" ON bus_routes FOR SELECT USING (true);

ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bus_stops" ON bus_stops FOR SELECT USING (true);
```

---

## 데이터 수집 전략

| 데이터 | 수집 방식 | 비고 |
|--------|----------|------|
| 관광지/맛집 | 크롤링 (Google 참조) | Google 검색 결과를 참조하여 주요 관광지/맛집 데이터 수집 후 DB 적재 |
| 버스 노선/정류장 | 교토시 오픈데이터 | GTFS 형식 또는 교토시 교통국 공개 데이터 활용 |
| 계절 행사 | 크롤링 (1회 등록) | Google 참조하여 초기 데이터 1회 수집. 주기적 업데이트 불필요 |
| 이미지 | Supabase Storage | 크롤링 시 이미지도 함께 수집 후 Storage에 업로드 |

## Supabase 프로젝트 정보

- **프로젝트 ID**: nqrlgirdmyxvxogqmmvc
- **리전**: ap-northeast-2 (서울)
- **대시보드**: https://supabase.com/dashboard/project/nqrlgirdmyxvxogqmmvc
