#!/bin/bash
set -uo pipefail

# SSD health collector for the admin dashboard (관리자 대시보드 "디스크 상태" 카드)
# - Must run as root: SMART 조회는 디바이스 raw 접근이 필요하다.
# - Output: logs/disk-health.json          (latest snapshot, 앱이 /app/logs 로 읽는다)
#           logs/disk-health-history.jsonl (하루 한 줄, 추세 계산용)
# - Install (root crontab, 매시 7분):
#     sudo crontab -e
#     7 * * * * /home/nbg/바탕화면/nh/scripts/disk-health.sh >> /home/nbg/바탕화면/nh/logs/disk-health.log 2>&1

PROJECT_ROOT="/home/nbg/바탕화면/nh"
DEVICE="${1:-/dev/nvme0n1}"
MOUNT_POINT="/"
OUT_DIR="${OUT_DIR:-${PROJECT_ROOT}/logs}"
OUT="${OUT_DIR}/disk-health.json"
HISTORY="${OUT_DIR}/disk-health-history.jsonl"
HISTORY_MAX_LINES=400

# root cron 의 기본 PATH 에는 /usr/sbin 이 없다
PATH="${PATH}:/usr/sbin:/sbin"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

mkdir -p "$OUT_DIR"

# smartctl 의 종료 코드는 비트마스크라 0 이 아니어도 출력은 유효할 수 있다.
# 성공 여부는 health log 가 실제로 들어 있는지로 판단한다.
SMART_JSON="$(smartctl -a -j "$DEVICE" 2>/dev/null)"
if ! echo "$SMART_JSON" | jq -e '.nvme_smart_health_information_log' >/dev/null 2>&1; then
    MSG="$(echo "$SMART_JSON" | jq -r '.smartctl.messages[0].string // empty' 2>/dev/null)"
    log "[FAIL] SMART read failed for ${DEVICE}: ${MSG:-no output} (root 로 실행했는지 확인)"
    exit 1
fi

read -r FS_TOTAL FS_USED FS_AVAIL < <(df -B1 --output=size,used,avail "$MOUNT_POINT" | tail -1)

TMP="$(mktemp "${OUT}.XXXXXX")"
if ! echo "$SMART_JSON" | jq \
    --arg collectedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg device "$DEVICE" \
    --arg mount "$MOUNT_POINT" \
    --argjson fsTotal "$FS_TOTAL" \
    --argjson fsUsed "$FS_USED" \
    --argjson fsAvail "$FS_AVAIL" \
    '.nvme_smart_health_information_log as $h | {
        collectedAt: $collectedAt,
        device: $device,
        model: .model_name,
        firmware: .firmware_version,
        capacityBytes: .user_capacity.bytes,
        smartPassed: .smart_status.passed,
        criticalWarning: $h.critical_warning,
        percentageUsed: $h.percentage_used,
        availableSpare: $h.available_spare,
        availableSpareThreshold: $h.available_spare_threshold,
        dataUnitsWritten: $h.data_units_written,
        dataUnitsRead: $h.data_units_read,
        mediaErrors: $h.media_errors,
        errorLogEntries: $h.num_err_log_entries,
        temperature: $h.temperature,
        powerOnHours: $h.power_on_hours,
        powerCycles: $h.power_cycles,
        unsafeShutdowns: $h.unsafe_shutdowns,
        filesystem: {
            mount: $mount,
            totalBytes: $fsTotal,
            usedBytes: $fsUsed,
            availBytes: $fsAvail
        }
    }' > "$TMP"; then
    rm -f "$TMP"
    log "[FAIL] could not build ${OUT}"
    exit 1
fi

# 컨테이너의 nextjs 사용자가 읽을 수 있어야 한다
chmod 644 "$TMP"
mv "$TMP" "$OUT"

# 하루 한 줄만 히스토리에 남긴다
TODAY="$(date +%Y-%m-%d)"
if ! tail -1 "$HISTORY" 2>/dev/null | grep -q "\"date\":\"${TODAY}\""; then
    jq -c --arg date "$TODAY" '{
        date: $date,
        percentageUsed,
        dataUnitsWritten,
        usedBytes: .filesystem.usedBytes
    }' "$OUT" >> "$HISTORY"
    if [ "$(wc -l < "$HISTORY")" -gt "$HISTORY_MAX_LINES" ]; then
        tail -n "$HISTORY_MAX_LINES" "$HISTORY" > "${HISTORY}.tmp" && mv "${HISTORY}.tmp" "$HISTORY"
    fi
    chmod 644 "$HISTORY"
fi

# root 로 만든 파일을 logs 디렉토리 소유자에게 돌려준다
chown --reference="$OUT_DIR" "$OUT" "$HISTORY" 2>/dev/null || true

log "[OK] wear=$(jq -r '.percentageUsed' "$OUT")% fs_used=$(( FS_USED * 100 / (FS_USED + FS_AVAIL) ))%"
