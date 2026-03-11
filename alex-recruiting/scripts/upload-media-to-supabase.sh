#!/bin/bash
# Upload local media files to Supabase Storage (public 'media' bucket).
# Files are uploaded preserving the path structure under public/.
# e.g., public/recruit/featured-clips/impact-1.mp4 → media bucket: recruit/featured-clips/impact-1.mp4
#
# Usage: cd alex-recruiting && bash scripts/upload-media-to-supabase.sh

set -euo pipefail

# Load env
if [ -f .env.local ]; then
  export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=' .env.local | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL in .env.local}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY in .env.local}"
BUCKET="media"

UPLOADED=0
SKIPPED=0
FAILED=0

get_mime() {
  case "${1##*.}" in
    mp4) echo "video/mp4" ;;
    jpg|jpeg) echo "image/jpeg" ;;
    png) echo "image/png" ;;
    webp) echo "image/webp" ;;
    webm) echo "video/webm" ;;
    md) echo "text/markdown" ;;
    *) echo "application/octet-stream" ;;
  esac
}

upload_file() {
  local local_path="$1"
  # Strip "public/" prefix → storage path
  local storage_path="${local_path#public/}"
  local mime=$(get_mime "$local_path")

  # Check if file already exists
  local check=$(curl -s -o /dev/null -w "%{http_code}" \
    "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storage_path}")

  if [ "$check" = "200" ]; then
    echo "  SKIP  ${storage_path} (already exists)"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi

  echo "  UP    ${storage_path} (${mime})"
  local status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storage_path}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: ${mime}" \
    -H "x-upsert: true" \
    --data-binary "@${local_path}")

  if [ "$status" = "200" ]; then
    UPLOADED=$((UPLOADED + 1))
  else
    echo "  FAIL  ${storage_path} (HTTP ${status})"
    FAILED=$((FAILED + 1))
  fi
}

echo "Uploading media to Supabase Storage (bucket: ${BUCKET})"
echo "URL: ${SUPABASE_URL}"
echo ""

# Upload recruit media
if [ -d "public/recruit" ]; then
  echo "=== public/recruit/ ==="
  find public/recruit -type f | sort | while read -r f; do
    upload_file "$f"
  done
fi

# Upload optimized-media
if [ -d "public/optimized-media" ]; then
  echo ""
  echo "=== public/optimized-media/ ==="
  find public/optimized-media -type f | sort | while read -r f; do
    upload_file "$f"
  done
fi

echo ""
echo "Done. Uploaded: ${UPLOADED}, Skipped: ${SKIPPED}, Failed: ${FAILED}"
echo ""
echo "Public URL pattern:"
echo "  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/recruit/featured-clips/impact-1.mp4"
