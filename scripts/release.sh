#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== @dannysmith/datepicker Release Script ===${NC}"
echo ""

# Pre-release checks
echo -e "${YELLOW}Running pre-release checks...${NC}"
bun run lint
bun run build:lib
echo -e "${GREEN}✓ All checks passed${NC}"
echo ""

# Get current version from package.json
CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo -e "Current version: ${BLUE}${CURRENT_VERSION}${NC}"

# Prompt for new version
echo ""
read -p "Enter new version (e.g., 0.2.0): " NEW_VERSION

# Validate version format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format. Use semver (e.g., 0.2.0)${NC}"
    exit 1
fi

# Confirm version is different
if [ "$CURRENT_VERSION" == "$NEW_VERSION" ]; then
    echo -e "${RED}Error: New version must be different from current version${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Updating version to ${NEW_VERSION}...${NC}"

# Update version in package.json
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json

echo -e "${GREEN}✓ Updated package.json${NC}"

# Git operations
echo ""
echo -e "${YELLOW}Ready to commit and tag:${NC}"
echo "  - Commit: Release ${NEW_VERSION}"
echo "  - Tag: v${NEW_VERSION} (signed)"
echo ""
read -p "Proceed with git operations? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo -e "${YELLOW}Aborted. Version files have been updated but not committed.${NC}"
    exit 0
fi

# Stage and commit
git add package.json
git commit -m "Release ${NEW_VERSION}"

# Create signed tag
git tag -s "v${NEW_VERSION}" -m "Release ${NEW_VERSION}"

echo -e "${GREEN}✓ Created commit and signed tag${NC}"

# Push
echo ""
read -p "Push to origin? (y/n): " PUSH_CONFIRM

if [ "$PUSH_CONFIRM" == "y" ]; then
    git push origin main
    git push origin "v${NEW_VERSION}"
    echo -e "${GREEN}✓ Pushed to origin${NC}"
    echo ""
    echo -e "${BLUE}=== Release complete! ===${NC}"
    echo ""
    echo "GitHub Actions will now:"
    echo "  1. Build and publish to npm"
    echo "  2. Deploy demo site to GitHub Pages"
    echo ""
    echo -e "Monitor: ${BLUE}https://github.com/dannysmith/datepicker-danny/actions${NC}"
    echo -e "Release: ${BLUE}https://github.com/dannysmith/datepicker-danny/releases/tag/v${NEW_VERSION}${NC}"
else
    echo ""
    echo -e "${YELLOW}Tag created locally but not pushed.${NC}"
    echo "To push manually:"
    echo "  git push origin main"
    echo "  git push origin v${NEW_VERSION}"
fi
