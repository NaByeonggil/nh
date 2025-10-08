#!/bin/bash

# Create backup directory if not exists
mkdir -p ./backup

# Set backup filename with timestamp
BACKUP_FILE="./backup/nh_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Starting database backup..."

# Backup database
docker-compose exec -T db mysqldump -u root -p${DB_ROOT_PASSWORD:-rootpassword123!} nh_production > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completed: $BACKUP_FILE"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo "🗜️ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Remove old backups (keep only last 7 days)
    find ./backup -name "*.gz" -mtime +7 -delete
    echo "🧹 Old backups cleaned up"
else
    echo "❌ Backup failed!"
    exit 1
fi