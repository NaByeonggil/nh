# 도커 자동 재시작 설정 완료 가이드

## 현재 상태 ✅

### 1. Docker 서비스 자동 시작
- **상태**: ✅ 활성화됨
- Docker 서비스가 시스템 부팅 시 자동으로 시작됩니다.

### 2. 컨테이너 재시작 정책
- **nh_database**: ✅ `restart: always`
- **nh_app**: ✅ `restart: always` 
- **nh_nginx**: ✅ `restart: always`

모든 컨테이너가 Docker 서비스 시작 후 자동으로 재시작됩니다.

## 추가 설정 (선택사항)

### systemd 서비스로 docker-compose 자동 시작

1. **서비스 파일 설치**:
```bash
sudo cp docker-compose-nh.service /etc/systemd/system/
sudo systemctl daemon-reload
```

2. **서비스 활성화**:
```bash
sudo systemctl enable docker-compose-nh.service
```

3. **서비스 시작 테스트**:
```bash
sudo systemctl start docker-compose-nh.service
sudo systemctl status docker-compose-nh.service
```

## 재시작 테스트 방법

### 방법 1: 컨테이너 재시작 테스트
```bash
# 컨테이너 중지
docker compose down

# 시스템 재부팅 없이 Docker 서비스 재시작
sudo systemctl restart docker

# 컨테이너 자동 재시작 확인 (약 30초 후)
docker ps
```

### 방법 2: 시스템 재부팅 테스트
```bash
# 시스템 재부팅
sudo reboot

# 재부팅 후 확인
docker ps
```

## 확인 사항

재시작 후 다음을 확인하세요:

1. **컨테이너 실행 상태**:
```bash
docker ps
```

2. **서비스 접속 테스트**:
- http://localhost:3000 (Next.js 앱)
- http://localhost (Nginx)
- 포트 3307 (MariaDB)

3. **로그 확인**:
```bash
docker logs nh_app
docker logs nh_database
docker logs nh_nginx
```

## 문제 해결

### 컨테이너가 시작되지 않는 경우:
1. Docker 서비스 상태 확인: `sudo systemctl status docker`
2. 네트워크 충돌 확인: `docker network ls`
3. 포트 충돌 확인: `netstat -tulpn | grep :3000`

### 부분적으로만 시작되는 경우:
1. 의존성 확인: MariaDB가 healthy 상태인지 확인
2. 수동 재시작: `docker compose up -d`

---

**현재 설정으로도 시스템 재시작 시 도커 컨테이너들이 자동으로 재시작됩니다!**