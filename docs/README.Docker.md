# Docker Production Deployment Guide

이 가이드는 옆집나약사(Neighbor Pharmacist) 프로젝트를 Docker를 통해 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker & Docker Compose 설치
- MySQL/MariaDB 데이터베이스
- 도메인 (선택사항, SSL 사용시)

## 🔧 설정

### 1. 환경 변수 설정

`.env.example`을 참고하여 `.env.production` 파일을 생성하세요:

```bash
cp .env.example .env.production
```

필수 환경 변수들을 설정하세요:

```bash
# Database Configuration
DATABASE_URL="mysql://username:password@mysql:3306/neighbor_pharmacist"
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=neighbor_pharmacist
MYSQL_USER=nh_user
MYSQL_PASSWORD=your_secure_password

# NextAuth.js Configuration
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=your_very_secure_secret_key

# Toss Payments
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
```

### 2. SSL 설정 (선택사항)

HTTPS를 사용하려면:

1. `ssl/` 디렉토리에 인증서 파일들을 배치
2. `nginx/conf.d/default.conf`에서 HTTPS 설정 주석 해제
3. 도메인명 수정

## 🚀 배포

### 자동 배포 (권장)

```bash
./scripts/deploy.sh
```

### 수동 배포

```bash
# Docker 이미지 빌드
docker-compose -f docker-compose.prod.yml build

# 서비스 시작
docker-compose -f docker-compose.prod.yml up -d

# 데이터베이스 마이그레이션
docker-compose -f docker-compose.prod.yml exec app npx prisma db push
```

## 📊 모니터링

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f mysql
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 헬스체크

```bash
# 애플리케이션 상태 확인
curl http://localhost:3000/api/health

# Nginx 상태 확인
curl http://localhost/health
```

### 서비스 상태 확인

```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 업데이트

```bash
# 서비스 중지
docker-compose -f docker-compose.prod.yml down

# 코드 업데이트 후 재배포
./scripts/deploy.sh
```

## 🛑 서비스 중지

```bash
# 서비스만 중지 (데이터 보존)
docker-compose -f docker-compose.prod.yml down

# 모든 데이터와 함께 제거
docker-compose -f docker-compose.prod.yml down -v
```

## 📁 디렉토리 구조

```
├── docker-compose.prod.yml    # 프로덕션 Docker Compose 설정
├── Dockerfile                 # Next.js 앱 Docker 이미지
├── nginx/
│   ├── nginx.conf            # Nginx 메인 설정
│   └── conf.d/
│       └── default.conf      # 사이트 설정
├── scripts/
│   └── deploy.sh            # 배포 스크립트
└── .env.production          # 프로덕션 환경 변수
```

## 🔒 보안 고려사항

1. **환경 변수**: 모든 시크릿 키들을 안전하게 관리
2. **방화벽**: 필요한 포트만 열기 (80, 443)
3. **SSL/TLS**: 프로덕션에서는 HTTPS 사용 권장
4. **데이터베이스**: 외부 접근 차단
5. **정기 업데이트**: Docker 이미지와 의존성 업데이트

## ⚡ 성능 최적화

1. **Nginx 캐싱**: 정적 파일 캐싱 활성화
2. **이미지 최적화**: 압축 및 형식 최적화
3. **데이터베이스**: 인덱스 최적화
4. **모니터링**: 리소스 사용량 모니터링

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**: 다른 서비스가 사용중인 포트 확인
2. **권한 문제**: Docker 그룹에 사용자 추가
3. **메모리 부족**: Docker에 충분한 메모리 할당
4. **DB 연결 실패**: DATABASE_URL 확인

### 로그 위치

- 애플리케이션: `docker-compose logs app`
- 데이터베이스: `docker-compose logs mysql`
- 웹서버: `docker-compose logs nginx`

## 📞 지원

문제가 발생하면 GitHub Issues에 보고하거나 로그와 함께 문의하세요.