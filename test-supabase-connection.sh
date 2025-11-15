#!/bin/bash

echo "🔍 Testing Supabase Connection..."
echo ""

# Load environment variables
source .env

echo "📋 Connection Details:"
echo "Project ID: wswvmprewdqcdyhgghib"
echo ""

echo "🌐 Testing DNS Resolution..."
echo "Direct URL host:"
nslookup db.wswvmprewdqcdyhgghib.supabase.co || echo "❌ DNS resolution failed for direct URL"
echo ""

echo "Pooler URL host:"
nslookup aws-0-us-east-1.pooler.supabase.com || echo "❌ DNS resolution failed for pooler URL"
echo ""

echo "🔌 Testing Connection with psql (if installed)..."
if command -v psql &> /dev/null; then
    echo "Testing direct connection..."
    psql "$DIRECT_URL" -c "SELECT version();" 2>&1 | head -5
else
    echo "⚠️  psql not installed, skipping connection test"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Go to https://app.supabase.com/project/wswvmprewdqcdyhgghib"
echo "2. Check if project status is 'Active' (not 'Paused' or 'Restoring')"
echo "3. Go to Settings → Database → Connection string"
echo "4. Verify the connection string matches what's in .env"
echo "5. If different, update .env with the correct values"
