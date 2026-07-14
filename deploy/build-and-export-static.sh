#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p frontend/dist db uploads

echo "==> Building images (api + build/assets)"
sudo docker compose build api
sudo docker compose build migrate

echo "==> Exporting frontend/dist for host nginx"
TMP_CID="$(sudo docker create --name medvedeva-assets-export medvedeva-build:latest true)"
sudo rm -rf frontend/dist
sudo docker cp "${TMP_CID}:/app/frontend/dist" frontend/dist
sudo docker rm "$TMP_CID" >/dev/null
sudo chown -R ubuntuuser:ubuntuuser frontend/dist

echo "==> Static export done: $(du -sh frontend/dist | awk '{print $1}')"
