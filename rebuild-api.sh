#!/bin/bash
# Rebuild the API image on this Proxmox host.
# AppArmor blocks RUN steps in Dockerfile, so we build by:
#   1. Running a container with apparmor disabled
#   2. pip install inside it
#   3. Committing as the base image
# Then the real Dockerfile just COPYs source on top.

set -e
cd "$(dirname "$0")"

echo "==> Stopping old API container..."
docker compose stop codetoolbox-api 2>/dev/null || true

echo "==> Building base image with deps..."
docker rm -f ctb-builder 2>/dev/null || true
docker run -d --name ctb-builder --security-opt apparmor=unconfined \
  -v "$PWD/api":/build python:3.12-slim sleep 600

docker exec ctb-builder pip install --no-cache-dir \
  fastapi==0.115.5 \
  "uvicorn[standard]==0.32.1" \
  httpx==0.28.1 \
  pydantic-settings==2.7.0

docker commit ctb-builder codetoolbox-api-base:latest
docker rm -f ctb-builder

echo "==> Building final image..."
DOCKER_BUILDKIT=0 docker build -t codetoolbox-api:latest ./api

echo "==> Starting containers..."
docker compose up -d

echo "==> Done. Health check:"
sleep 2
curl -s http://localhost:3110/api/health
echo ""
