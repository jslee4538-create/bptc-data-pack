# 교토 여가 가이드 (Kyoto Leisure Guide) -- 디자인 문서

> Show Me The PRD로 생성됨 (2026-05-27)

## 문서 구성

| 문서 | 내용 | 언제 읽나 |
|------|------|----------|
| [01_PRD.md](./01_PRD.md) | 뭘 만드는지, 누가 쓰는지, 핵심 기능과 성공 기준 | 프로젝트 시작 전 |
| [02_DATA_MODEL.md](./02_DATA_MODEL.md) | 7개 엔티티의 데이터 구조와 관계도 | DB 설계할 때 |
| [03_PHASES.md](./03_PHASES.md) | MVP → 확장 → 고도화 3단계 로드맵 | 개발 순서 정할 때 |
| [04_PROJECT_SPEC.md](./04_PROJECT_SPEC.md) | 기술 스택, 프로젝트 구조, AI 행동 규칙, SQL | AI에게 코드 시킬 때마다 |

## 프로젝트 요약

- **제품**: 교토 교환학생을 위한 여가 가이드 모바일 웹앱
- **사용자**: 교토 소재 대학 교환학생 전체
- **플랫폼**: 모바일 웹앱 (PWA 예정)
- **기술 스택**: Next.js 15 + Supabase + Vercel + Tailwind CSS 4 + Leaflet
- **인증**: 소셜 로그인 (Google)

## 다음 단계

Phase 1을 시작하려면 [03_PHASES.md](./03_PHASES.md)의 **"Phase 1 시작 프롬프트"**를 복사해서 AI에게 붙여넣으세요.

## 결정된 사항

- [x] 관광지/맛집 초기 데이터 → **크롤링**
- [x] 버스 노선/정류장 → **교토시 오픈데이터**
- [x] Phase 1 언어 → **한국어만** (다국어는 Phase 2)
- [x] 이미지 저장소 → **Supabase Storage**
- [x] 크롤링 대상 → **Google 검색 결과** 참조
- [x] 계절 행사 업데이트 → **불필요** (1회 등록)
- [x] tags 저장 방식 → **배열(TEXT[])**
- [x] 카카오 OAuth → **불필요** (Google만 사용)

## Supabase 프로젝트 정보

- **프로젝트명**: kyoto-leisure-guide
- **프로젝트 ID**: nqrlgirdmyxvxogqmmvc
- **리전**: ap-northeast-2 (서울)
- **상태**: ACTIVE_HEALTHY
- **플랜**: Free ($0/월)

## 미결 사항 (NEEDS CLARIFICATION)

> 현재 미결 사항 없음. 모든 사항이 결정되었습니다. Phase 1 개발을 시작할 수 있습니다.
