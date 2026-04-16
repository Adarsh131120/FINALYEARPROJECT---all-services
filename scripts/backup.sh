#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup..."

# Backup MongoDB
mongodump --db malware_detection --out "$BACKUP_DIR/mongodb"

# Backup uploaded files
cp -r backend/uploads "$BACKUP_DIR/"

# Backup logs
cp -r backend/logs "$BACKUP_DIR/"
cp -r ml-service/logs "$BACKUP_DIR/" 2>/dev/null

# Backup configuration
cp backend/.env "$BACKUP_DIR/backend.env"
cp ml-service/.env "$BACKUP_DIR/ml-service.env"
cp frontend/.env "$BACKUP_DIR/frontend.env"

# Create archive
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "✅ Backup created: $BACKUP_DIR.tar.gz"