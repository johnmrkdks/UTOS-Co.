#!/bin/bash

# Distance Migration Script
# Converts distance fields from INTEGER (meters) to REAL (kilometers)

set -e

echo "🚀 Distance Migration Script"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ wrangler command not found${NC}"
    echo "Please install wrangler or run from the correct directory"
    exit 1
fi

# Migration file
MIGRATION_FILE="drizzle/migrations/sqlite/0005_convert_distance_to_real.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Migration file: $MIGRATION_FILE${NC}"
echo ""

# Function to run migration
run_migration() {
    local ENV=$1
    local DB_NAME=$2
    local IS_REMOTE=$3

    echo -e "${BLUE}🔄 Running migration on: $DB_NAME ($ENV)${NC}"
    echo ""

    # Check current schema before migration
    echo -e "${YELLOW}📊 Checking current schema...${NC}"
    if [ "$IS_REMOTE" = "true" ]; then
        wrangler d1 execute $DB_NAME --$ENV --command="PRAGMA table_info(bookings);" 2>/dev/null | grep -E "estimated_distance|actual_distance" || echo "  (unable to fetch schema)"
    else
        wrangler d1 execute $DB_NAME --local --command="PRAGMA table_info(bookings);" 2>/dev/null | grep -E "estimated_distance|actual_distance" || echo "  (unable to fetch schema)"
    fi
    echo ""

    # Show sample data before migration
    echo -e "${YELLOW}📋 Sample data BEFORE migration:${NC}"
    if [ "$IS_REMOTE" = "true" ]; then
        wrangler d1 execute $DB_NAME --$ENV --command="SELECT id, estimated_distance, actual_distance FROM bookings WHERE estimated_distance IS NOT NULL LIMIT 3;" 2>/dev/null || echo "  (no data or unable to fetch)"
    else
        wrangler d1 execute $DB_NAME --local --command="SELECT id, estimated_distance, actual_distance FROM bookings WHERE estimated_distance IS NOT NULL LIMIT 3;" 2>/dev/null || echo "  (no data or unable to fetch)"
    fi
    echo ""

    # Run migration
    echo -e "${GREEN}⚡ Executing migration...${NC}"
    if [ "$IS_REMOTE" = "true" ]; then
        wrangler d1 execute $DB_NAME --$ENV --file=$MIGRATION_FILE
    else
        wrangler d1 execute $DB_NAME --local --file=$MIGRATION_FILE
    fi
    echo ""

    # Show sample data after migration
    echo -e "${GREEN}✅ Sample data AFTER migration:${NC}"
    if [ "$IS_REMOTE" = "true" ]; then
        wrangler d1 execute $DB_NAME --$ENV --command="SELECT id, estimated_distance, actual_distance FROM bookings WHERE estimated_distance IS NOT NULL LIMIT 3;" 2>/dev/null || echo "  (no data or unable to fetch)"
    else
        wrangler d1 execute $DB_NAME --local --command="SELECT id, estimated_distance, actual_distance FROM bookings WHERE estimated_distance IS NOT NULL LIMIT 3;" 2>/dev/null || echo "  (no data or unable to fetch)"
    fi
    echo ""

    echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
    echo ""
}

# Menu
echo "Select database to migrate:"
echo ""
echo "  1) Local Development (down-under-chauffeur-test-db --local)"
echo "  2) Remote Test (down-under-chauffeur-test-db --remote)"
echo "  3) Staging (down-under-chauffeur-db --env staging)"
echo "  4) Production (down-under-chauffeur-db --env production)"
echo "  5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        run_migration "local" "down-under-chauffeur-test-db" "false"
        ;;
    2)
        run_migration "remote" "down-under-chauffeur-test-db" "true"
        ;;
    3)
        echo -e "${YELLOW}⚠️  This will modify STAGING database${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            run_migration "staging" "down-under-chauffeur-db" "true"
        else
            echo "Migration cancelled"
        fi
        ;;
    4)
        echo -e "${RED}⚠️  WARNING: This will modify PRODUCTION database!${NC}"
        read -p "Type 'MIGRATE PRODUCTION' to confirm: " confirm
        if [ "$confirm" = "MIGRATE PRODUCTION" ]; then
            run_migration "production" "down-under-chauffeur-db" "true"
        else
            echo "Migration cancelled"
        fi
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ All done!${NC}"
echo ""
