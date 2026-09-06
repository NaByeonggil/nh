#!/bin/bash
set -euo pipefail

# 어디서 호출하든 프로젝트 루트에서 동작하게 한다 (docker compose 가 compose 파일을 찾아야 한다)
cd "$(dirname "$0")"

# 자격증명은 docker-compose.yml 과 같은 변수(MYSQL_*)를 .env 에서 읽는다.
# 예전에는 DB_ROOT_PASSWORD 를 참조하면서 .env 를 읽지 않아,
# 항상 기본값으로 폴백해 인증에 실패했다.
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

: "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD 가 .env 에 없습니다}"
DB_NAME="${MYSQL_DATABASE:-nh_production}"

mkdir -p ./backup
BACKUP_FILE="./backup/nh_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 데이터베이스 백업 시작... (${DB_NAME})"

# MariaDB 11.4 이미지에는 mysqldump 가 없다 (mariadb-dump 로 이름이 바뀌었다).
# 암호는 argv 대신 MYSQL_PWD 로 넘겨 컨테이너 프로세스 목록에 노출되지 않게 한다.
# --single-transaction: 운영 중인 DB 를 테이블 잠금 없이 일관되게 뜬다.
if ! docker compose exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" db \
        mariadb-dump -u root --single-transaction --quick "$DB_NAME" > "$BACKUP_FILE"; then
    echo "❌ 백업 실패"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 리다이렉트는 명령이 실패해도 파일을 만든다. 덤프가 끝까지 나왔는지 내용으로 확인한다.
if ! tail -5 "$BACKUP_FILE" | grep -q "Dump completed"; then
    echo "❌ 덤프가 완결되지 않았습니다 (파일 삭제)"
    rm -f "$BACKUP_FILE"
    exit 1
fi

gzip "$BACKUP_FILE"
echo "✅ 백업 완료: ${BACKUP_FILE}.gz ($(du -h "${BACKUP_FILE}.gz" | cut -f1))"

# 7일 지난 백업 정리.
# 예전 패턴은 *.gz 라 backup/ 안의 다른 아카이브(tar.gz 등)까지 지웠다.
find ./backup -name 'nh_backup_*.sql.gz' -mtime +7 -delete
echo "🧹 7일 지난 백업 정리 완료"
