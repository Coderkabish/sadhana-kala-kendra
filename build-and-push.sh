#!/bin/bash
# build-and-push.sh - Build and push Docker images to registry
# Usage: ./build-and-push.sh <registry-url> <version>
# Example: ./build-and-push.sh docker.io/youruser 1.0.0

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY=${1:-docker.io/youruser}
VERSION=${2:-latest}
BACKEND_IMAGE="$REGISTRY/sadhana-backend:$VERSION"
FRONTEND_IMAGE="$REGISTRY/sadhana-frontend:$VERSION"
BACKEND_LATEST="$REGISTRY/sadhana-backend:latest"
FRONTEND_LATEST="$REGISTRY/sadhana-frontend:latest"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Verify we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Run this script from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}Building Docker images for Sadhana Kala Kendra...${NC}"

# Build backend
echo -e "${YELLOW}Building backend image: $BACKEND_IMAGE${NC}"
docker build -t "$BACKEND_IMAGE" -t "$BACKEND_LATEST" ./backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}Building frontend image: $FRONTEND_IMAGE${NC}"
docker build -t "$FRONTEND_IMAGE" -t "$FRONTEND_LATEST" ./next-frontend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

# Test images
echo -e "${YELLOW}Testing images...${NC}"
docker run --rm "$BACKEND_IMAGE" node --version
docker run --rm "$FRONTEND_IMAGE" node --version
echo -e "${GREEN}✓ Images tested successfully${NC}"

# Prompt for push
echo -e "${YELLOW}Images built successfully!${NC}"
echo -e "${YELLOW}Backend: $BACKEND_IMAGE${NC}"
echo -e "${YELLOW}Frontend: $FRONTEND_IMAGE${NC}"

read -p "Push images to registry? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing backend image...${NC}"
    docker push "$BACKEND_IMAGE"
    docker push "$BACKEND_LATEST"
    echo -e "${GREEN}✓ Backend pushed${NC}"

    echo -e "${YELLOW}Pushing frontend image...${NC}"
    docker push "$FRONTEND_IMAGE"
    docker push "$FRONTEND_LATEST"
    echo -e "${GREEN}✓ Frontend pushed${NC}"

    echo -e "${GREEN}All images pushed successfully!${NC}"
else
    echo -e "${YELLOW}Push cancelled. Images are available locally.${NC}"
fi
