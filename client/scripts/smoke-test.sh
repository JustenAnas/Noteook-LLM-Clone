#!/usr/bin/env bash
set -euo pipefail
echo "Starting frontend smoke test..."
echo "Check dev server on http://localhost:3000/auth"
curl -f http://localhost:3000/auth || {
  echo "Failed to reach /auth"
  exit 2
}
echo "OK"
