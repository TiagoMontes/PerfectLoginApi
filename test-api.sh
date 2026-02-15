#!/bin/bash

API_URL="http://localhost:3000"

echo "=== Testing Authentication Flow ==="
echo ""

echo "1. Health Check"
curl -s "$API_URL/health" | jq .
echo ""

echo "2. Create User (Sign Up)"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "phone": "+1234567890",
    "address": "123 Test St"
  }')
echo "$SIGNUP_RESPONSE" | jq .
echo ""

echo "3. Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo ""

echo "4. Logout"
curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== All tests completed ==="
