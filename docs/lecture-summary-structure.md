# 강의 요약 아카이브 구조 제안 (옆집나약사)

강의 내용을 장기적으로 축적하고, 같은 주제로 추가 정리본까지 관리하기 위한 구조 제안입니다.
핵심은 **기록은 날짜별로, 학습·탐색은 주제별로** 설계하는 것입니다.

> 이 문서는 `lecture-summary-structure.md`(초안)을 다듬은 버전으로, 옆집나약사 프로젝트(Next.js 14 + Prisma) 적용을 전제로 합니다.

## 핵심 원칙

- **기록 단위는 날짜**로 생성합니다. (강의가 끝날 때마다 1개 문서)
- **탐색 단위는 주제**로 묶습니다. 단, 주제는 URL 경로에 1:1로 박지 않고 **태그/관계(N:N)** 로 연결합니다.
- **요일은 URL 키가 아니라 `date`에서 파생**되는 표시 정보입니다. 별도 저장하지 않습니다.
- **추가본(addendum)은 별도 URL이 아니라 문서의 버전(revision)** 으로 관리하고, "최종본"은 별도 페이지가 아니라 `status` 플래그로 표현합니다.

## 추천 URL 구조

기록은 날짜 단위, 탐색은 주제 허브로 이원화합니다.

```text
/lectures                      # 전체 강의 (날짜/주제/태그 필터)
/lectures/{date}/{slug}        # 강의 노트 1개 (정식 URL, 항상 최신 버전 노출)
/topics                        # 주제 목록
/topics/{topic}                # 주제 허브 + 통합본(overview)
```

### 예시

```text
/lectures/2026-06-09/pharmacokinetics-basics
/topics/pharmacokinetics
```

> **초안 대비 변경점**
> - `/lectures/{topic}/{date}` → `/lectures/{date}/{slug}` : 한 날에 여러 주제 강의가 있어도 입력이 자연스럽고, 한 강의가 여러 주제에 걸칠 수 있습니다.
> - `addendum-1`, `addendum-2`, `final`을 **별도 URL로 만들지 않습니다.** 검색·링크·SEO 분산을 막기 위해 한 노트는 정식 URL 하나를 유지하고, 추가본은 내부 버전으로 둡니다.

## 이렇게 설계하는 이유

### 1. 주제 중심 누적이 쉽습니다
같은 주제로 다른 날짜에 강의가 이어져도 한 허브(`/topics/{topic}`) 아래 계속 연결됩니다. 주제를 N:N 관계로 두면 한 강의를 여러 주제에 동시에 묶을 수 있습니다.

### 2. 날짜순 정리·검색이 쉽습니다
날짜를 기록 키로 쓰면 정렬, 아카이브, 백업, 회차 추적이 편합니다.

### 3. 추가본·최종본을 깔끔히 분리합니다
원본 정리본과 나중 보완 내용을 버전으로 분리하면 학습 흐름과 편집 이력이 보존되되, 독자는 항상 같은 URL에서 최신/최종 내용을 봅니다.

## 문서 메타데이터

각 강의 노트에 저장할 필드입니다. (초안에서 `weekday`, `final_version`은 파생/상태로 대체해 제거)

| 필드 | 설명 |
|---|---|
| title | 문서 제목 |
| slug | URL 슬러그 |
| date | 강의 날짜 (요일은 여기서 파생) |
| sequence | 회차 |
| topics | 관련 주제 (N:N) |
| tags | 세부 태그 |
| summary | 짧은 요약 |
| key_points | 핵심 포인트 |
| questions | 추가 확인할 질문 |
| related_topics | 관련 주제 |
| status | `DRAFT` / `REVIEWED` / `FINAL` |

## 홈페이지 메뉴 제안

블로그형보다 **지식 아카이브형** 구성이 적합합니다.

- 전체 강의
- 주제별 보기
- 날짜별 보기
- 태그별 보기
- 통합 노트(주제 overview)
- 검색

### 메인 화면 블록

1. 최근 정리본
2. 주제별 모아보기
3. 이번 주 강의
4. 최근 업데이트된 추가본
5. 많이 본 주제

## 프로젝트 적용안 (Prisma)

기존 `Content` 모델과 성격이 달라 별도 모델을 권장합니다.

```prisma
model Lecture {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  date      DateTime          // 기록 키 (요일은 파생)
  sequence  Int?              // 회차
  summary   String?  @db.Text
  keyPoints String?  @db.Text // JSON 배열
  body      String?  @db.LongText
  status    LectureStatus @default(DRAFT)
  viewCount Int      @default(0)
  topics    Topic[]  @relation("LectureTopics")
  revisions LectureRevision[] // 추가본 = 버전
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Topic {
  id       String    @id @default(cuid())
  slug     String    @unique
  name     String
  overview String?   @db.LongText // 주제 통합본
  lectures Lecture[] @relation("LectureTopics")
}

model LectureRevision {
  id        String   @id @default(cuid())
  lectureId String
  lecture   Lecture  @relation(fields: [lectureId], references: [id])
  note      String   @db.LongText
  createdAt DateTime @default(now())
}

enum LectureStatus { DRAFT REVIEWED FINAL }
```

### 라우트 (App Router)

```text
src/app/lectures/page.tsx
src/app/lectures/[date]/[slug]/page.tsx
src/app/topics/page.tsx
src/app/topics/[slug]/page.tsx
```

## 한 줄 정리

**기록은 날짜별로, 학습과 탐색은 주제별로.** 추가본은 별도 페이지가 아니라 버전으로, 최종 여부는 상태로 관리하는 방식이 가장 오래 가고 확장성이 좋습니다.
