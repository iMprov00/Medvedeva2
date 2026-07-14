#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="/home/ubuntuuser/backups"
STAMP="$(date +%Y%m%d)"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"
DB="$ROOT/db/production.sqlite3"
UPLOADS="$ROOT/uploads"

if [[ -f "$DB" ]]; then
  OUT_DB="$BACKUP_DIR/medvedeva_${STAMP}.sqlite3"
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB" ".backup '$OUT_DB'"
  else
    # hot-copy via docker api container if available
    if sudo docker compose -f "$ROOT/docker-compose.yml" ps --status running -q api >/dev/null 2>&1; then
      sudo docker compose -f "$ROOT/docker-compose.yml" exec -T api \
        node -e "const fs=require('fs');fs.copyFileSync('/app/db/production.sqlite3','/app/db/backup-tmp.sqlite3')"
      cp "$ROOT/db/backup-tmp.sqlite3" "$OUT_DB"
      rm -f "$ROOT/db/backup-tmp.sqlite3"
    else
      cp "$DB" "$OUT_DB"
    fi
  fi
  gzip -f "$OUT_DB"
fi

if [[ -d "$UPLOADS" ]] && [[ -n "$(ls -A "$UPLOADS" 2>/dev/null || true)" ]]; then
  tar -czf "$BACKUP_DIR/medvedeva_uploads_${STAMP}.tar.gz" -C "$ROOT" uploads
fi

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'medvedeva_*.sqlite3.gz' -o -name 'medvedeva_uploads_*.tar.gz' \) -mtime +${KEEP_DAYS} -delete

echo "Backup complete for $STAMP"
