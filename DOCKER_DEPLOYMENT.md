# 🐳 옆집약사 (Neighbor Pharmacist) - Docker 프로덕션 배포 가이드

## 📋 사전 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상
- 최소 2GB RAM
- 최소 10GB 디스크 공간

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.production` 파일을 수정하여 프로덕션 환경에 맞게 설정하세요:

```bash
# 보안을 위해 반드시 변경해야 할 항목들
NEXTAUTH_SECRET=your-secure-random-string-here  # 반드시 변경!
DB_ROOT_PASSWORD=strong-root-password          # 반드시 변경!
DB_PASSWORD=strong-user-password              # 반드시 변경!
NEXTAUTH_URL=https://your-domain.com          # 실제 도메인으로 변경
```

### 2. 배포 실행

```bash
# 배포 스크립트 실행
./deploy.sh

# 또는 수동으로 실행
docker-compose up -d
```

### 3. 서비스 확인

```bash
# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 보기
docker-compose logs -f app
```

## 📦 Docker 구성

### 서비스 구조

1. **db** (MariaDB 11.4)
   - 포트: 3306
   - 데이터베이스: nh_production
   - 볼륨: mariadb_data (영구 저장)

2. **app** (Next.js 애플리케이션)
   - 포트: 3000
   - Node.js 18 Alpine
   - Prisma ORM

3. **nginx** (리버스 프록시)
   - 포트: 80, 443
   - 정적 파일 캐싱
   - 로드 밸런싱

## 🔧 관리 명령어

### 데이터베이스 백업

```bash
# 백업 생성
./backup.sh

# 수동 백업
docker-compose exec db mysqldump -u root -p nh_production > backup.sql
```

### 데이터베이스 복원

```bash
# 백업 파일로부터 복원
docker-compose exec -T db mysql -u root -p nh_production < backup.sql
```

### 서비스 관리

```bash
# 모든 서비스 중지
docker-compose down

# 특정 서비스 재시작
docker-compose restart app

# 로그 확인 (실시간)
docker-compose logs -f

# 컨테이너 쉘 접속
docker-compose exec app sh
```

### 데이터베이스 마이그레이션

```bash
# Prisma 스키마 동기화
docker-compose exec app npx prisma db push

# Prisma 클라이언트 재생성
docker-compose exec app npx prisma generate
```

## 🔒 보안 설정

### SSL/HTTPS 설정

1. SSL 인증서를 `nginx/ssl/` 디렉토리에 배치
2. `nginx/conf.d/default.conf`에서 HTTPS 설정 활성화:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ...
}
```

### 방화벽 설정

```bash
# HTTP/HTTPS 포트만 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

## 🔄 업데이트 절차

1. **백업 생성**
   ```bash
   ./backup.sh
   ```

2. **새 버전 빌드**
   ```bash
   docker-compose build app
   ```

3. **롤링 업데이트**
   ```bash
   docker-compose up -d --no-deps app
   ```

## 🐛 문제 해결

### 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker-compose logs app

# 컨테이너 상태 확인
docker ps -a

# 네트워크 확인
docker network ls
```

### 데이터베이스 연결 오류

```bash
# 데이터베이스 컨테이너 확인
docker-compose exec db mysql -u root -p

# 연결 테스트
docker-compose exec app npx prisma db push
```

### 디스크 공간 부족

```bash
# Docker 정리
docker system prune -a

# 오래된 이미지 삭제
docker image prune -a

# 볼륨 정리 (주의!)
docker volume prune
```

## 📊 모니터링

### 리소스 사용량 확인

```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
docker system df
```

### 헬스체크

```bash
# 서비스 상태
docker-compose ps

# 애플리케이션 헬스체크
curl http://localhost:3000/api/health
```

## 📝 환경별 설정

### 개발 환경

```bash
# 개발 모드로 실행
docker-compose -f docker-compose.dev.yml up
```

### 스테이징 환경

```bash
# 스테이징 환경 변수 로드
export $(cat .env.staging | xargs)
docker-compose up -d
```

### 프로덕션 환경

```bash
# 프로덕션 배포
./deploy.sh
```

## 🔄 CI/CD 통합

GitHub Actions를 사용한 자동 배포:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && ./deploy.sh'
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Docker 로그: `docker-compose logs`
2. 애플리케이션 로그: `docker-compose logs app`
3. 데이터베이스 로그: `docker-compose logs db`
4. Nginx 로그: `docker-compose logs nginx`

## 📄 라이선스

이 프로젝트는 비공개 소프트웨어입니다.