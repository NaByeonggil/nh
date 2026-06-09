#!/bin/bash
set -uo pipefail

# Daily backup script for nh (Neighbor Pharmacist)
# - Destination: /home/nbg/SynologyDrive/personhealth-backup/nh/daily/<YYYYMMDD>/
# - Contents: .env(env.txt), DB dump, uploads, nginx (conf+ssl), prisma schema
# - Retention: 30 days

PROJECT_ROOT="/home/nbg/바탕화면/nh"
BACKUP_BASE="/home/nbg/SynologyDrive/personhealth-backup/nh/daily"
DATE_STAMP="$(date +%Y%m%d)"
DEST="${BACKUP_BASE}/${DATE_STAMP}"
LOG="${DEST}/backup.log"
RETENTION_DAYS=7

DB_CONTAINER="nh_database"
DB_NAME="nh_production"

mkdir -p "$DEST"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"
}

log "=== Daily backup start ==="
log "Destination: $DEST"

FAILED=0

# 1) .env → env.txt
if [ -f "${PROJECT_ROOT}/.env" ]; then
    cp "${PROJECT_ROOT}/.env" "${DEST}/env.txt"
    log "[OK] env.txt ($(stat -c%s "${DEST}/env.txt") bytes)"
else
    log "[WARN] .env not found at ${PROJECT_ROOT}/.env"
fi

# 2) DB dump
DB_PWD="$(grep -E '^MYSQL_ROOT_PASSWORD=' "${PROJECT_ROOT}/.env" 2>/dev/null | cut -d= -f2- || echo '')"
if [ -z "$DB_PWD" ]; then
    DB_PWD="$(grep -E '^DB_ROOT_PASSWORD=' "${PROJECT_ROOT}/.env" 2>/dev/null | cut -d= -f2- || echo '')"
fi
if [ -n "$DB_PWD" ] && docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
    if docker exec -e MYSQL_PWD="$DB_PWD" "$DB_CONTAINER" \
        mariadb-dump --single-transaction --quick --lock-tables=false \
        -uroot "$DB_NAME" 2>>"$LOG" | gzip > "${DEST}/db.sql.gz"; then
        SIZE=$(stat -c%s "${DEST}/db.sql.gz")
        if [ "$SIZE" -gt 100 ]; then
            log "[OK] db.sql.gz (${SIZE} bytes)"
        else
            log "[FAIL] db.sql.gz too small (${SIZE} bytes)"
            FAILED=1
        fi
    else
        log "[FAIL] mariadb-dump failed"
        FAILED=1
    fi
else
    log "[FAIL] DB container not running or password missing"
    FAILED=1
fi

# 3) uploads
if [ -d "${PROJECT_ROOT}/public/uploads" ]; then
    if tar -czf "${DEST}/uploads.tar.gz" -C "${PROJECT_ROOT}/public" uploads 2>>"$LOG"; then
        log "[OK] uploads.tar.gz ($(stat -c%s "${DEST}/uploads.tar.gz") bytes)"
    else
        log "[FAIL] uploads tar failed"
        FAILED=1
    fi
fi

# 4) nginx (conf.d + ssl)
if [ -d "${PROJECT_ROOT}/nginx" ]; then
    if tar -czf "${DEST}/nginx.tar.gz" -C "${PROJECT_ROOT}" nginx 2>>"$LOG"; then
        log "[OK] nginx.tar.gz ($(stat -c%s "${DEST}/nginx.tar.gz") bytes)"
    else
        log "[FAIL] nginx tar failed"
        FAILED=1
    fi
fi

# 5) Prisma schema (reference)
if [ -f "${PROJECT_ROOT}/prisma/schema.prisma" ]; then
    cp "${PROJECT_ROOT}/prisma/schema.prisma" "${DEST}/prisma-schema.prisma"
    log "[OK] prisma-schema.prisma"
fi

# 6) Rotation
DELETED=$(find "$BACKUP_BASE" -mindepth 1 -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -print -exec rm -rf {} + 2>/dev/null | wc -l)
log "[OK] rotation: removed ${DELETED} old folder(s) (>${RETENTION_DAYS} days)"

if [ "$FAILED" -eq 0 ]; then
    log "=== Daily backup OK ==="
    exit 0
else
    log "=== Daily backup FINISHED WITH ERRORS ==="
    exit 1
fi
