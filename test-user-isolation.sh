#!/bin/bash

# User Isolation Testing Script
# This script helps test the user isolation fixes by providing quick login commands

echo "======================================"
echo "  SQLPulse User Isolation Testing"
echo "======================================"
echo ""
echo "Available test users:"
echo ""
echo "1. Admin User"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo "   Role: admin"
echo ""
echo "2. Developer User"
echo "   Email: dev@example.com"
echo "   Password: dev123"
echo "   Role: developer"
echo ""
echo "======================================"
echo ""

# Backend URL (change if needed)
API_URL="http://localhost:8080/api"

# Function to login and get token
login() {
    local email=$1
    local password=$2
    local role=$3
    
    echo "Logging in as $role..."
    response=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo "❌ Login failed for $role"
        echo "Response: $response"
        return 1
    else
        echo "✅ Login successful for $role"
        echo ""
        echo "Token: $token"
        echo ""
        echo "Export this token to use in API calls:"
        echo "export ${role^^}_TOKEN=\"$token\""
        echo ""
        return 0
    fi
}

# Menu
echo "Choose an action:"
echo "1) Login as Admin"
echo "2) Login as Developer"
echo "3) Login as both (export tokens)"
echo "4) Test connection isolation"
echo "5) Test schedule isolation"
echo "6) Test query isolation"
echo "7) Exit"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        login "admin@example.com" "admin123" "admin"
        ;;
    2)
        login "dev@example.com" "dev123" "developer"
        ;;
    3)
        echo "Logging in as both users..."
        echo ""
        login "admin@example.com" "admin123" "admin"
        ADMIN_TOKEN=$token
        echo ""
        login "dev@example.com" "dev123" "developer"
        DEVELOPER_TOKEN=$token
        echo ""
        echo "Tokens exported:"
        echo "ADMIN_TOKEN=$ADMIN_TOKEN"
        echo "DEVELOPER_TOKEN=$DEVELOPER_TOKEN"
        ;;
    4)
        echo "Testing connection isolation..."
        echo ""
        echo "1. Login as admin and developer"
        login "admin@example.com" "admin123" "admin"
        ADMIN_TOKEN=$token
        login "dev@example.com" "dev123" "developer"
        DEV_TOKEN=$token
        
        echo ""
        echo "2. Get admin's connections:"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/connections" | jq
        
        echo ""
        echo "3. Get developer's connections:"
        curl -s -H "Authorization: Bearer $DEV_TOKEN" "$API_URL/connections" | jq
        
        echo ""
        echo "4. Get all connections (admin only):"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/connections?showAll=true" | jq
        ;;
    5)
        echo "Testing schedule isolation..."
        echo ""
        echo "1. Login as admin and developer"
        login "admin@example.com" "admin123" "admin"
        ADMIN_TOKEN=$token
        login "dev@example.com" "dev123" "developer"
        DEV_TOKEN=$token
        
        echo ""
        echo "2. Get admin's schedules:"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/schedules" | jq
        
        echo ""
        echo "3. Get developer's schedules:"
        curl -s -H "Authorization: Bearer $DEV_TOKEN" "$API_URL/schedules" | jq
        
        echo ""
        echo "4. Get all schedules (admin only):"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/schedules?showAll=true" | jq
        ;;
    6)
        echo "Testing query isolation..."
        echo ""
        echo "1. Login as admin and developer"
        login "admin@example.com" "admin123" "admin"
        ADMIN_TOKEN=$token
        login "dev@example.com" "dev123" "developer"
        DEV_TOKEN=$token
        
        echo ""
        echo "2. Get admin's queries:"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/queries" | jq
        
        echo ""
        echo "3. Get developer's queries (includes public queries):"
        curl -s -H "Authorization: Bearer $DEV_TOKEN" "$API_URL/queries" | jq
        
        echo ""
        echo "4. Get all queries (admin only):"
        curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/queries?showAll=true" | jq
        ;;
    7)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
