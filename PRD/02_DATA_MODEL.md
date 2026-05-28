# 교토 여가 가이드 (Kyoto Leisure Guide) -- 데이터 모델

> 이 문서는 앱에서 다루는 핵심 데이터의 구조를 정의합니다.
> 개발자가 아니어도 이해할 수 있는 "개념적 ERD"입니다.

---

## 전체 구조

```
[User] --1:N--> [Bookmark]
  |                  |
  |            [Place] <--N:1-- [Bookmark] (target_type='place')
  |            [Event] <--N:1-- [Bookmark] (target_type='event')
  |
[Place] --N:1--> [Category]
[Place] --N:M--> [BusStop] (근처 정류장)
[Event] --N:1--> [Place] (행사 장소 연결)
[BusStop] --N:M--> [BusRoute] (경유 노선)
```

---

## 엔티티 상세

### User (사용자)
교환학생 사용자. 소셜 로그인으로 가입하며 즐겨찾기를 저장할 수 있다.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (Supabase Auth UID) | uuid-abc-123 | O |
| email | 로그인 이메일 | kim@univ.ac.kr | O |
| nickname | 닉네임 | 교토탐험가 | O |
| university | 소속 대학 | 도시샤 대학 | X |
| period_start | 교환 시작일 | 2026-09-01 | X |
| period_end | 교환 종료일 | 2027-02-28 | X |
| created_at | 가입일 (자동) | 2026-08-15 | O |

### Place (장소 - 관광지/맛집/카페)
교토의 볼거리, 맛집, 카페 등. 카테고리로 분류되며 지도 위 좌표를 가진다.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동) | plc-001 | O |
| name | 장소명 | 후시미 이나리 대사 | O |
| name_ja | 일본어 장소명 | 伏見稲荷大社 | X |
| category_id | 카테고리 연결 | cat-01 | O |
| description | 한 줄 설명 | 수천 개의 붉은 도리이가 이어지는 신사 | O |
| address | 주소 | 교토시 후시미구 후카쿠사야부노우치초 68 | O |
| lat | 위도 | 34.9671 | O |
| lng | 경도 | 135.7727 | O |
| price_range | 가격대 (1=무료, 2=보통, 3=비쌈) | 1 | X |
| opening_hours | 운영시간 | 24시간 (경내 자유) | X |
| image_url | 대표 이미지 URL | /img/fushimi-inari.jpg | X |
| tags | 태그 배열 | ["신사", "무료", "사진명소", "하이킹"] | X |
| created_at | 등록일 (자동) | 2026-01-01 | O |

### Category (카테고리)
장소를 분류하는 카테고리. 아이콘과 함께 표시된다.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | cat-01 | O |
| name | 카테고리명 | 신사/사찰 | O |
| icon | 아이콘 (이모지 또는 아이콘명) | ⛩️ | X |

**초기 카테고리 목록**: 신사/사찰, 맛집, 카페, 자연/공원, 문화체험, 쇼핑, 야경/뷰

### Event (계절 행사/이벤트)
교토의 사계절 행사. 벚꽃, 기온 마츠리, 단풍 등.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동) | evt-001 | O |
| title | 행사명 | 기온 마츠리 (祇園祭) | O |
| description | 설명 | 일본 3대 축제 중 하나. 7월 한 달간... | O |
| start_date | 시작일 | 2026-07-01 | O |
| end_date | 종료일 | 2026-07-31 | O |
| season | 계절 (spring/summer/autumn/winter) | summer | O |
| place_id | 연결 장소 (있는 경우) | plc-010 | X |
| image_url | 대표 이미지 URL | /img/gion-matsuri.jpg | X |
| created_at | 등록일 (자동) | 2026-01-01 | O |

### BusRoute (버스 노선)
교토 시내 버스 노선. 주요 관광지를 연결하는 노선 정보.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | bus-100 | O |
| route_number | 노선 번호 | 100 | O |
| route_name | 노선명 (주요 경유지) | 교토역 → 금각사 | O |
| color | 노선 색상 (지도 표시용) | #E53935 | X |

### BusStop (버스 정류장)
버스 정류장. 지도 위 좌표를 가지며 여러 노선이 경유할 수 있다.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 | stp-001 | O |
| name | 정류장명 | 교토역앞 (京都駅前) | O |
| lat | 위도 | 34.9856 | O |
| lng | 경도 | 135.7588 | O |
| route_ids | 경유 노선 ID 목록 | ["bus-100", "bus-205", "bus-206"] | O |

### Bookmark (즐겨찾기)
사용자가 저장한 장소 또는 행사. 다형성 관계(polymorphic)로 장소와 행사 모두 저장 가능.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동) | bk-001 | O |
| user_id | 사용자 연결 | uuid-abc-123 | O |
| target_type | 대상 종류 ('place' 또는 'event') | place | O |
| target_id | 대상 ID | plc-001 | O |
| created_at | 저장일 (자동) | 2026-09-10 | O |

---

## 관계 요약

- **User** 1명이 여러 개의 **Bookmark**을 가질 수 있음
- **Place** 1개는 1개의 **Category**에 속함
- **Event** 1개는 선택적으로 1개의 **Place**와 연결됨
- **BusStop** 1개에 여러 개의 **BusRoute**가 경유함 (N:M)
- **Bookmark**은 **Place** 또는 **Event** 중 하나를 가리킴 (다형성)

---

## 왜 이 구조인가

- **확장성**: Phase 2에서 Course(코스) 엔티티 추가 시 Place와 연결만 하면 됨. Phase 3의 커뮤니티(후기) 추가 시에도 User-Place 관계 확장으로 대응 가능
- **단순성**: 7개 엔티티로 3가지 핵심 기능을 모두 커버. 불필요한 중간 테이블 없이 직관적인 관계
- **Supabase 친화적**: PostgreSQL의 배열 타입(tags, route_ids)을 활용하여 별도 조인 테이블 최소화

---

## 결정된 사항

- [x] 이미지 저장 → **Supabase Storage** 사용. image_url 필드에는 Supabase Storage의 공개 URL 저장
- [x] 초기 데이터 → 관광지/맛집은 **크롤링**, 버스 노선/정류장은 **교토시 오픈데이터**

## 추가 결정 사항

- [x] Place의 tags → **배열(TEXT[])** 저장 (별도 테이블 없음)
- [x] BusStop의 route_ids → **배열(TEXT[])** 저장 (조인 테이블 없음)
