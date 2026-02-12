#!/bin/bash

# Authentication Testing Script
# Run this to test all authentication endpoints

API_URL="https://hostel-bazar.onrender.com/api"

echo "🧪 Testing HostelBazar Authentication System"
echo "=============================================="
echo ""

# Test 1: API Health Check
echo "1️⃣ Testing API Health..."
curl -s "$API_URL/test" | json_pp
echo ""
echo "---"
echo ""

# Test 2: Owner Login
echo "2️⃣ Testing Owner Login..."
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com","password":"Owner@123"}' | json_pp
echo ""
echo "---"
echo ""

# Test 3: Student Login
echo "3️⃣ Testing Student Login..."
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@hostelbazar.com","password":"Student@123"}' | json_pp
echo ""
echo "---"
echo ""

# Test 4: Staff Login
echo "4️⃣ Testing Staff Login..."
curl -s -X POST "$API_URL/auth/staff-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@hostelbazar.com","password":"Staff@123","staffId":"STAFF001"}' | json_pp
echo ""
echo "---"
echo ""

# Test 5: Forgot Password
echo "5️⃣ Testing Forgot Password..."
curl -s -X POST "$API_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@hostelbazar.com"}' | json_pp
echo ""
echo "---"
echo ""

echo "✅ Testing Complete!"
echo ""
echo "Expected Results:"
echo "- API Health: Should return success message"
echo "- Owner Login: Should return token and user data"
echo "- Student Login: Should return token and user data"
echo "- Staff Login: Should return token and user data"
echo "- Forgot Password: Should return userId and success message"
