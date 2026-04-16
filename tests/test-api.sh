#!/bin/bash
# tests/test-api.sh

API_URL="http://localhost:5000"

echo "Testing Malware Detection API..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$API_URL/health" | jq .

# Test upload (using EICAR test file)
echo -e "\n2. Testing file upload..."
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > test.exe

UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "file=@test.exe" \
  "$API_URL/api/upload")

echo "$UPLOAD_RESPONSE" | jq .

TASK_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.taskId')

# Test status endpoint
echo -e "\n3. Testing status endpoint..."
sleep 2
curl -s "$API_URL/api/analysis/status/$TASK_ID" | jq .

# Test statistics
echo -e "\n4. Testing statistics endpoint..."
curl -s "$API_URL/api/analysis/statistics" | jq .

rm test.exe

echo -e "\n✓ API tests complete!"