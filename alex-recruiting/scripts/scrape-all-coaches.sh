#!/bin/bash
# Scrape ALL coaches across D2 and D3 divisions
# Usage: ./scripts/scrape-all-coaches.sh [division] [batch_size]

DIVISION="${1:-D2}"
BATCH_SIZE="${2:-25}"
SECRET="e739a155d823e0939a6f9d55c706e34e897d8036f8d8feba3547a3576589bc0c"
BASE_URL="http://localhost:3000/api/data-pipeline/scrape-coaches"
OFFSET=0
TOTAL_OL=0
TOTAL_DL=0
TOTAL_UPSERTED=0
BATCH_NUM=1

echo "=== Scraping $DIVISION coaches (batch size: $BATCH_SIZE) ==="

while true; do
  echo ""
  echo "--- Batch $BATCH_NUM (offset: $OFFSET) ---"

  RESULT=$(curl -s -X POST "$BASE_URL" \
    -H "Authorization: Bearer $SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"division\":\"$DIVISION\",\"batchSize\":$BATCH_SIZE,\"offset\":$OFFSET}")

  # Extract stats
  OL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['stats']['olCoachesFound'])" 2>/dev/null)
  DL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['stats']['dlCoachesFound'])" 2>/dev/null)
  UPSERTED=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['stats']['upserted'])" 2>/dev/null)
  HAS_MORE=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['batch']['hasMore'])" 2>/dev/null)
  NEXT=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['batch']['nextOffset'])" 2>/dev/null)
  PROCESSED=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['batch']['processed'])" 2>/dev/null)
  TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['batch']['totalInDivision'])" 2>/dev/null)

  TOTAL_OL=$((TOTAL_OL + OL))
  TOTAL_DL=$((TOTAL_DL + DL))
  TOTAL_UPSERTED=$((TOTAL_UPSERTED + UPSERTED))

  echo "  Processed: $PROCESSED/$TOTAL | OL: $OL | DL: $DL | Upserted: $UPSERTED"
  echo "  Running totals — OL: $TOTAL_OL | DL: $TOTAL_DL | Upserted: $TOTAL_UPSERTED"

  if [ "$HAS_MORE" = "False" ] || [ "$HAS_MORE" = "false" ] || [ "$NEXT" = "None" ] || [ "$NEXT" = "null" ]; then
    echo ""
    echo "=== $DIVISION COMPLETE ==="
    echo "Total OL coaches: $TOTAL_OL"
    echo "Total DL coaches: $TOTAL_DL"
    echo "Total upserted: $TOTAL_UPSERTED"
    break
  fi

  OFFSET=$NEXT
  BATCH_NUM=$((BATCH_NUM + 1))

  # Small delay between batches
  sleep 2
done
