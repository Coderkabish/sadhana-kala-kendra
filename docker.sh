#!/bin/bash
# docker.sh - Docker convenience wrapper for Sadhana Kala Kendra
# Usage: ./docker.sh [command]
# Commands: start, stop, restart, logs, status, shell, clean, build

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect development mode
DEV_MODE=${DOCKER_DEV:-0}
COMPOSE_FILE="docker-compose.yml"
if [ "$DEV_MODE" = "1" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
fi

# Function to print colored headers
header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Main command handler
case "${1:-help}" in
    start)
        header "Starting Sadhana Kala Kendra Services"
        if [ "$DEV_MODE" = "1" ]; then
            info "Using development configuration"
        fi
        docker-compose -f "$COMPOSE_FILE" up -d
        success "Services started"
        echo ""
        docker-compose -f "$COMPOSE_FILE" ps
        ;;

    stop)
        header "Stopping Services"
        docker-compose -f "$COMPOSE_FILE" stop
        success "Services stopped"
        ;;

    restart)
        header "Restarting Services"
        docker-compose -f "$COMPOSE_FILE" restart
        success "Services restarted"
        ;;

    logs)
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            docker-compose -f "$COMPOSE_FILE" logs -f
        else
            docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
        fi
        ;;

    status)
        header "Service Status"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;

    health)
        header "Health Check"
        info "Backend health:"
        curl -s http://localhost:5000/health | jq . || error "Backend not responding"
        echo ""
        info "Frontend:"
        curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000
        ;;

    shell)
        SERVICE=${2:-backend}
        header "Opening shell in $SERVICE"
        docker-compose -f "$COMPOSE_FILE" exec "$SERVICE" sh
        ;;

    build)
        header "Building Images"
        docker-compose -f "$COMPOSE_FILE" build
        success "Build complete"
        ;;

    rebuild)
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            header "Rebuilding All Images"
            docker-compose -f "$COMPOSE_FILE" build --no-cache
        else
            header "Rebuilding $SERVICE"
            docker-compose -f "$COMPOSE_FILE" build --no-cache "$SERVICE"
        fi
        success "Rebuild complete"
        ;;

    clean)
        header "Cleaning Up"
        read -p "Remove all containers and volumes? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f "$COMPOSE_FILE" down -v
            success "Cleanup complete - all containers and volumes removed"
        else
            info "Cleanup cancelled"
        fi
        ;;

    db-dump)
        header "Exporting Database"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="backup_$TIMESTAMP.sql"
        docker-compose -f "$COMPOSE_FILE" exec -T mysql mysqldump \
            -u "$(grep DB_USER .env | cut -d'=' -f2)" \
            -p"$(grep DB_PASSWORD .env | cut -d'=' -f2)" \
            "$(grep DB_NAME .env | cut -d'=' -f2)" > "$BACKUP_FILE"
        success "Database exported to $BACKUP_FILE"
        ;;

    db-restore)
        BACKUP_FILE=${2:-backup.sql}
        if [ ! -f "$BACKUP_FILE" ]; then
            error "File not found: $BACKUP_FILE"
            exit 1
        fi
        header "Restoring Database from $BACKUP_FILE"
        docker-compose -f "$COMPOSE_FILE" exec -T mysql mysql \
            -u "$(grep DB_USER .env | cut -d'=' -f2)" \
            -p"$(grep DB_PASSWORD .env | cut -d'=' -f2)" \
            "$(grep DB_NAME .env | cut -d'=' -f2)" < "$BACKUP_FILE"
        success "Database restored"
        ;;

    logs-tail)
        LINES=${2:-100}
        docker-compose -f "$COMPOSE_FILE" logs --tail "$LINES"
        ;;

    dev)
        header "Starting in Development Mode"
        export DOCKER_DEV=1
        docker-compose -f docker-compose.dev.yml up
        ;;

    prod)
        header "Starting in Production Mode"
        export DOCKER_DEV=0
        docker-compose -f docker-compose.yml up -d
        success "Running in production mode"
        ;;

    exec)
        SERVICE=$2
        shift 2
        docker-compose -f "$COMPOSE_FILE" exec "$SERVICE" "$@"
        ;;

    help|--help|-h)
        cat << EOF
${BLUE}Sadhana Kala Kendra - Docker Convenience Wrapper${NC}

${YELLOW}Usage:${NC}
    ./docker.sh [command] [options]

${YELLOW}Commands:${NC}
    ${GREEN}start${NC}              Start all services
    ${GREEN}stop${NC}               Stop all services
    ${GREEN}restart${NC}            Restart all services
    ${GREEN}status${NC}             Show service status
    ${GREEN}logs${NC}               Show logs (all or specific service)
                       ${BLUE}./docker.sh logs backend${NC}
    ${GREEN}logs-tail${NC}           Show last N lines of logs (default: 100)
                       ${BLUE}./docker.sh logs-tail 50${NC}
    ${GREEN}health${NC}             Check service health
    ${GREEN}shell${NC}              Open shell in container
                       ${BLUE}./docker.sh shell backend${NC}
    ${GREEN}build${NC}              Build images
    ${GREEN}rebuild${NC}            Rebuild images (no cache)
                       ${BLUE}./docker.sh rebuild backend${NC}
    ${GREEN}clean${NC}              Remove all containers and volumes
    ${GREEN}db-dump${NC}            Export database to SQL file
    ${GREEN}db-restore${NC}         Restore database from SQL file
                       ${BLUE}./docker.sh db-restore backup.sql${NC}
    ${GREEN}exec${NC}               Execute command in container
                       ${BLUE}./docker.sh exec backend npm list${NC}
    ${GREEN}dev${NC}                Start in development mode (hot reload)
    ${GREEN}prod${NC}               Start in production mode
    ${GREEN}help${NC}               Show this help message

${YELLOW}Examples:${NC}
    ${BLUE}./docker.sh start${NC}           # Start all services
    ${BLUE}./docker.sh logs backend${NC}    # View backend logs
    ${BLUE}./docker.sh shell mysql${NC}     # Connect to MySQL shell
    ${BLUE}./docker.sh db-dump${NC}         # Backup database
    ${BLUE}./docker.sh dev${NC}             # Development with hot reload

${YELLOW}Environment:${NC}
    Set ${BLUE}DOCKER_DEV=1${NC} to use development configuration
    Example: ${BLUE}DOCKER_DEV=1 ./docker.sh start${NC}

EOF
        ;;

    *)
        error "Unknown command: $1"
        echo "Run './docker.sh help' for usage information"
        exit 1
        ;;
esac
