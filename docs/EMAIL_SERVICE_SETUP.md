# 이메일 서비스 설정 가이드

옆집약사 플랫폼에서 이메일 알림 기능을 사용하기 위한 설정 가이드입니다.

## 목차

1. [개요](#개요)
2. [환경 변수 설정](#환경-변수-설정)
3. [이메일 서비스 제공자 설정](#이메일-서비스-제공자-설정)
   - [Google Workspace / Gmail](#1-google-workspace--gmail)
   - [AWS SES](#2-aws-ses)
   - [SendGrid](#3-sendgrid)
   - [Naver Works](#4-naver-works)
   - [자체 SMTP 서버](#5-자체-smtp-서버)
4. [cancerwith.kr 도메인 이메일 설정](#cancerwithkr-도메인-이메일-설정)
5. [테스트](#테스트)
6. [문제 해결](#문제-해결)

---

## 개요

이메일 알림 기능은 다음과 같은 경우에 사용됩니다:
- 새로운 문의가 등록되었을 때 관리자에게 알림
- 주문 확인 및 배송 알림 (향후 확장 가능)
- 계정 관련 알림 (향후 확장 가능)

현재는 **문의 등록 시 관리자 이메일 알림** 기능이 구현되어 있습니다.

---

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정해야 합니다:

```bash
# 이메일/SMTP 설정
SMTP_HOST=smtp.gmail.com          # SMTP 서버 주소
SMTP_PORT=587                     # SMTP 포트 (587: TLS, 465: SSL)
SMTP_SECURE=false                 # true: SSL(465), false: TLS(587)
SMTP_USER=your_email@gmail.com    # SMTP 인증 사용자명
SMTP_PASS=your_app_password       # SMTP 인증 비밀번호
SMTP_FROM=your_email@gmail.com    # 발신자 이메일 주소
ADMIN_EMAIL=admin@cancerwith.kr   # 알림을 받을 관리자 이메일
```

### 환경 변수 설명

- **SMTP_HOST**: 이메일 서비스 제공자의 SMTP 서버 주소
- **SMTP_PORT**: SMTP 포트 번호
  - `587`: STARTTLS (권장)
  - `465`: SSL/TLS
  - `25`: 일반 SMTP (보안 위험, 비권장)
- **SMTP_SECURE**: SSL 사용 여부
  - `true`: 465 포트 사용 시
  - `false`: 587 포트 사용 시
- **SMTP_USER**: SMTP 인증에 사용할 이메일 주소
- **SMTP_PASS**: SMTP 인증 비밀번호 (앱 비밀번호 권장)
- **SMTP_FROM**: 발신자로 표시될 이메일 주소
- **ADMIN_EMAIL**: 알림을 받을 관리자 이메일 주소

---

## 이메일 서비스 제공자 설정

### 1. Google Workspace / Gmail

cancerwith.kr 도메인으로 Google Workspace를 사용하는 경우 권장됩니다.

#### 1.1 Google Workspace (권장)

**장점:**
- cancerwith.kr 도메인 이메일 사용 가능 (예: admin@cancerwith.kr)
- 높은 신뢰도 및 전송률
- 무료 평가판 제공

**설정 방법:**

1. **Google Workspace 계정 생성**
   - https://workspace.google.com/ 접속
   - 도메인 등록 및 인증 (cancerwith.kr)
   - 사용자 계정 생성 (예: admin@cancerwith.kr)

2. **2단계 인증 활성화**
   - Google 계정 설정 → 보안 → 2단계 인증 활성화

3. **앱 비밀번호 생성**
   - Google 계정 설정 → 보안 → 2단계 인증 → 앱 비밀번호
   - 앱 선택: "메일", 기기 선택: "기타"
   - 생성된 16자리 비밀번호 복사

4. **환경 변수 설정**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@cancerwith.kr
SMTP_PASS=xxxx xxxx xxxx xxxx  # 앱 비밀번호
SMTP_FROM=admin@cancerwith.kr
ADMIN_EMAIL=admin@cancerwith.kr
```

#### 1.2 일반 Gmail (개발/테스트용)

**설정 방법:**

1. **Google 계정 설정**
   - Gmail 계정 로그인
   - 2단계 인증 활성화
   - 앱 비밀번호 생성 (위와 동일)

2. **환경 변수 설정**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # 앱 비밀번호
SMTP_FROM=your_email@gmail.com
ADMIN_EMAIL=your_email@gmail.com
```

**제한사항:**
- 일 500건 전송 제한
- 발신자가 @gmail.com으로 표시됨
- 운영 환경에는 비권장

---

### 2. AWS SES

대용량 이메일 전송이 필요한 경우 권장됩니다.

**장점:**
- 저렴한 비용 (월 62,000건까지 무료)
- 높은 확장성
- 세부적인 통계 및 모니터링

**설정 방법:**

1. **AWS SES 설정**
   - AWS Console → SES 접속
   - 리전 선택 (예: ap-northeast-2, 서울)
   - "Verified identities" → 이메일 주소 또는 도메인 인증

2. **SMTP 자격 증명 생성**
   - SES → Account dashboard → SMTP settings
   - "Create SMTP credentials" 클릭
   - IAM 사용자 생성 및 자격 증명 다운로드

3. **샌드박스 모드 해제 (프로덕션 환경)**
   - SES는 기본적으로 샌드박스 모드 (인증된 이메일로만 전송 가능)
   - 프로덕션 사용 시 AWS에 샌드박스 해제 요청 필요

4. **환경 변수 설정**
```bash
SMTP_HOST=email-smtp.ap-northeast-2.amazonaws.com  # 리전에 따라 변경
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIAXXXXXXXXXXXXXXXX  # AWS SES SMTP 사용자명
SMTP_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # AWS SES SMTP 비밀번호
SMTP_FROM=admin@cancerwith.kr
ADMIN_EMAIL=admin@cancerwith.kr
```

**참고:** 도메인을 인증하면 해당 도메인의 모든 이메일 주소 사용 가능

---

### 3. SendGrid

간편한 설정과 관리가 필요한 경우 권장됩니다.

**장점:**
- 월 100건 무료 (무료 플랜)
- 간단한 API 및 SMTP 설정
- 상세한 이메일 통계

**설정 방법:**

1. **SendGrid 계정 생성**
   - https://sendgrid.com 가입
   - 이메일 인증 완료

2. **Sender Identity 설정**
   - Settings → Sender Authentication
   - Single Sender Verification 또는 Domain Authentication 선택
   - 도메인 인증 시 DNS 레코드 추가 필요

3. **API Key 생성**
   - Settings → API Keys → Create API Key
   - "Restricted Access" 선택, Mail Send 권한 부여
   - API Key 복사 (다시 볼 수 없음)

4. **환경 변수 설정**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey  # 고정값 "apikey"
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # API Key
SMTP_FROM=admin@cancerwith.kr
ADMIN_EMAIL=admin@cancerwith.kr
```

---

### 4. Naver Works

네이버 계정으로 비즈니스 이메일을 사용하는 경우 권장됩니다.

**설정 방법:**

1. **Naver Works 가입**
   - https://works.naver.com/ 접속
   - 도메인 등록 및 이메일 계정 생성

2. **SMTP 설정**
   - Naver Works Admin → 보안 설정
   - SMTP 사용 허용

3. **환경 변수 설정**
```bash
SMTP_HOST=smtp.worksmobile.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@cancerwith.kr
SMTP_PASS=your_password
SMTP_FROM=admin@cancerwith.kr
ADMIN_EMAIL=admin@cancerwith.kr
```

---

### 5. 자체 SMTP 서버

직접 메일 서버를 운영하는 경우입니다.

**요구사항:**
- Postfix, Exim, Sendmail 등 SMTP 서버 설치
- 25, 587, 465 포트 개방
- SPF, DKIM, DMARC 레코드 설정 (스팸 방지)
- 리버스 DNS 설정

**환경 변수 설정**
```bash
SMTP_HOST=mail.cancerwith.kr
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@cancerwith.kr
SMTP_PASS=your_password
SMTP_FROM=admin@cancerwith.kr
ADMIN_EMAIL=admin@cancerwith.kr
```

---

## cancerwith.kr 도메인 이메일 설정

cancerwith.kr 도메인에서 이메일을 보내려면 다음 중 하나를 선택해야 합니다:

### 옵션 1: Google Workspace (권장)

- **비용:** 사용자당 월 6,000원~
- **장점:**
  - 간편한 설정
  - 높은 신뢰도
  - Gmail 인터페이스 사용 가능
  - 자동 스팸 필터링
- **설정:** [Google Workspace 섹션](#11-google-workspace-권장) 참조

### 옵션 2: AWS SES + Route 53

- **비용:** 거의 무료 (월 62,000건까지)
- **장점:**
  - 저렴한 비용
  - 높은 확장성
- **단점:**
  - 설정이 복잡함
  - 이메일 클라이언트 별도 필요
- **설정:** [AWS SES 섹션](#2-aws-ses) 참조

### 옵션 3: SendGrid + Domain Authentication

- **비용:** 월 100건까지 무료, 유료 플랜은 월 $19.95~
- **장점:**
  - 간편한 설정
  - 무료 플랜 제공
- **설정:** [SendGrid 섹션](#3-sendgrid) 참조

### 도메인 인증 (SPF/DKIM/DMARC)

어떤 서비스를 선택하든, 도메인 DNS에 다음 레코드를 추가하는 것이 권장됩니다:

**SPF 레코드 (Sender Policy Framework):**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all  # Google Workspace 사용 시
```

**DKIM 레코드 (DomainKeys Identified Mail):**
- 각 이메일 서비스 제공자가 제공하는 DKIM 키 추가

**DMARC 레코드 (Domain-based Message Authentication):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@cancerwith.kr
```

---

## 테스트

### 1. 로컬 테스트

이메일 설정이 올바른지 테스트하려면 새 문의를 등록해보세요:

1. 웹사이트에서 문의게시판 접속
2. 새 문의 작성 및 제출
3. 관리자 이메일로 알림이 도착하는지 확인

### 2. 로그 확인

Docker 로그에서 이메일 전송 결과를 확인할 수 있습니다:

```bash
docker-compose logs -f app | grep -i email
```

**성공 시:**
```
Email sent: <message-id@example.com>
```

**실패 시:**
```
Email send error: [Error details]
Failed to send email notification: [Error details]
```

### 3. 환경 변수 검증

이메일 설정이 누락된 경우 경고 메시지가 출력됩니다:

```
Missing email configuration: SMTP_USER, SMTP_PASS
```

---

## 문제 해결

### 1. 이메일이 전송되지 않는 경우

**확인 사항:**
- 환경 변수가 올바르게 설정되었는지 확인
- SMTP 자격 증명이 유효한지 확인
- 방화벽에서 SMTP 포트가 열려있는지 확인
- Docker 컨테이너를 재시작해보세요: `docker-compose restart app`

**로그 확인:**
```bash
docker-compose logs app | grep -i "email\|smtp"
```

### 2. 인증 오류 (Authentication failed)

**원인:**
- 잘못된 SMTP 사용자명 또는 비밀번호
- 2단계 인증이 활성화된 경우 앱 비밀번호 미사용

**해결:**
- Gmail/Google Workspace: 앱 비밀번호 생성 및 사용
- 다른 서비스: 올바른 SMTP 자격 증명 확인

### 3. 연결 오류 (Connection timeout/refused)

**원인:**
- 잘못된 SMTP 호스트 또는 포트
- 방화벽에서 포트 차단

**해결:**
```bash
# Docker 컨테이너 내에서 연결 테스트
docker-compose exec app nc -zv smtp.gmail.com 587
```

### 4. 이메일이 스팸함으로 가는 경우

**원인:**
- SPF/DKIM/DMARC 레코드 미설정
- 발신자 도메인과 실제 이메일 도메인 불일치

**해결:**
- DNS에 SPF, DKIM, DMARC 레코드 추가
- 이메일 서비스 제공자의 도메인 인증 완료
- 발신자 평판 개선 (스팸 신고 방지)

### 5. SendGrid API Key 오류

**원인:**
- 잘못된 API Key
- API Key 권한 부족

**해결:**
- SendGrid에서 새 API Key 생성
- "Mail Send" 권한 확인
- SMTP_USER는 반드시 "apikey"로 설정

---

## 추가 참고 자료

- [Nodemailer 공식 문서](https://nodemailer.com/)
- [Google Workspace SMTP 설정](https://support.google.com/a/answer/176600)
- [AWS SES 개발자 가이드](https://docs.aws.amazon.com/ses/)
- [SendGrid 문서](https://docs.sendgrid.com/)
- [SPF/DKIM/DMARC 설정 가이드](https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/)

---

## 문의

이메일 설정 관련 문제가 있으시면 시스템 관리자에게 문의하세요.
