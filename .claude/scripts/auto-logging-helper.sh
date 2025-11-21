#!/bin/bash
# YOYAKU Auto-Logging Helper Script
# Automatically detects changes and prepares logging context
# Used by Claude AI for session closure logging
# Version: 1.0.0
# Author: Benjamin Belaga

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 YOYAKU Auto-Logging Detection${NC}"
echo "=================================================="

# Initialize counters
CHANGES_DETECTED=0
YYD_CHANGES=0
YOYAKU_CHANGES=0

# Function to check git repo for changes
check_git_repo() {
    local repo_path=$1
    local repo_name=$2
    local site=$3

    if [[ -d "$repo_path" ]]; then
        cd "$repo_path"
        if git diff --quiet && git diff --cached --quiet; then
            echo -e "  ✅ $repo_name: No changes"
            return 0
        else
            echo -e "  ${YELLOW}📝 $repo_name: CHANGES DETECTED${NC}"

            # Show modified files
            git status --short | while read -r line; do
                echo -e "     $line"
            done

            ((CHANGES_DETECTED++))
            if [[ "$site" == "yyd" ]]; then
                ((YYD_CHANGES++))
            elif [[ "$site" == "yoyaku" ]]; then
                ((YOYAKU_CHANGES++))
            fi

            return 1
        fi
    fi
}

echo ""
echo -e "${BLUE}📦 Checking Theme Repositories...${NC}"
check_git_repo ~/repos/yyd-theme "YYD Theme" "yyd"
check_git_repo ~/repos/yoyaku-theme "YOYAKU Theme" "yoyaku"

echo ""
echo -e "${BLUE}🔌 Checking Plugin Repositories...${NC}"
check_git_repo ~/repos/ysc "YSC Plugin" "yyd"
check_git_repo ~/repos/yio "YIO Plugin" "yoyaku"
check_git_repo ~/repos/yofr "YOFR Plugin" "yyd"
check_git_repo ~/work/yid-translation "YID Plugin" "both"

echo ""
echo -e "${BLUE}📋 Checking Log Repositories...${NC}"
check_git_repo ~/repos/logs-yydistribution-fr "Logs YYD" "yyd"
check_git_repo ~/repos/logs-yoyaku-io "Logs YOYAKU" "yoyaku"

echo ""
echo "=================================================="

if [[ $CHANGES_DETECTED -eq 0 ]]; then
    echo -e "${GREEN}✅ NO CHANGES DETECTED${NC}"
    echo "Aucune modification technique - pas de log nécessaire"
    exit 0
else
    echo -e "${YELLOW}⚠️  CHANGES DETECTED: $CHANGES_DETECTED repos modified${NC}"
    echo ""

    if [[ $YYD_CHANGES -gt 0 ]]; then
        echo -e "${BLUE}🏢 YYD.FR (B2B):${NC} $YYD_CHANGES repos modified"
        echo "   → Logs repo: ~/repos/logs-yydistribution-fr/"
        echo "   → GitHub: https://github.com/benjaminbelaga/logs-yydistribution-fr"
    fi

    if [[ $YOYAKU_CHANGES -gt 0 ]]; then
        echo -e "${BLUE}🎵 YOYAKU.IO (B2C):${NC} $YOYAKU_CHANGES repos modified"
        echo "   → Logs repo: ~/repos/logs-yoyaku-io/"
        echo "   → GitHub: https://github.com/benjaminbelaga/logs-yoyaku-io"
    fi

    echo ""
    echo -e "${RED}🚨 LOGGING REQUIRED${NC}"
    echo "AI should now execute full logging protocol"
    exit 1
fi
