#!/bin/bash

# 蓝绿部署脚本
# 用法: ./deploy.sh [command]
# 命令: deploy | status | rollback | switch | init

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
STATE_FILE="$PROJECT_DIR/.deploy-state"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.blue-green.yml"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取当前活跃环境
get_active() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "none"
    fi
}

# 设置活跃环境
set_active() {
    echo "$1" > "$STATE_FILE"
    log_success "Active environment set to: $1"
}

# 检查容器健康状态
check_health() {
    local container=$1
    local max_attempts=30
    local attempt=0

    log_info "Waiting for $container to be healthy..."

    while [ $attempt -lt $max_attempts ]; do
        if docker ps --filter "name=$container" --filter "health=healthy" | grep -q "$container"; then
            log_success "$container is healthy"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done

    echo ""
    log_error "$container failed health check after $max_attempts attempts"
    return 1
}

# 初始化部署
init() {
    log_info "Initializing blue-green deployment..."

    if [ "$(get_active)" != "none" ]; then
        log_warn "Already initialized. Current active: $(get_active)"
        return 1
    fi

    # 创建 nginx conf.d 目录
    mkdir -p "$PROJECT_DIR/nginx/conf.d"

    # 启动 blue 环境和 nginx
    log_info "Starting blue environment..."
    docker compose -f "$COMPOSE_FILE" --profile blue up -d --build

    # 等待健康检查
    check_health "club-app-blue"

    # 设置活跃环境
    set_active "blue"

    # 创建初始 nginx 配置
    switch_nginx_config "blue"

    log_success "Initialization complete. Blue environment is active."
    log_info "Access your application at http://localhost:3000"
}

# 部署新版本
deploy() {
    local current=$(get_active)
    local target

    if [ "$current" == "none" ]; then
        log_error "Not initialized. Run './deploy.sh init' first."
        return 1
    fi

    if [ "$current" == "blue" ]; then
        target="green"
    else
        target="blue"
    fi

    log_info "Current active: $current"
    log_info "Deploying to: $target"

    # 构建并启动目标环境和 nginx
    log_info "Building and starting $target environment..."
    docker compose -f "$COMPOSE_FILE" --profile $target up -d --build

    # 等待健康检查
    if ! check_health "club-app-$target"; then
        log_error "Deployment failed. $target environment is not healthy."
        log_warn "Rolling back..."
        docker compose -f "$COMPOSE_FILE" --profile $target down
        return 1
    fi

    # 切换 nginx
    log_info "Switching traffic to $target..."
    switch_nginx_config "$target"

    # 更新状态
    set_active "$target"

    # 停止旧环境（保留 nginx）
    log_info "Stopping old $current environment..."
    docker stop "club-app-$current" 2>/dev/null || true
    docker rm "club-app-$current" 2>/dev/null || true

    log_success "Deployment complete. $target environment is now active."
}

# 回滚
rollback() {
    local current=$(get_active)
    local target

    if [ "$current" == "none" ]; then
        log_error "Not initialized. Nothing to rollback."
        return 1
    fi

    if [ "$current" == "blue" ]; then
        target="green"
    else
        target="blue"
    fi

    log_info "Current active: $current"
    log_info "Rolling back to: $target"

    # 检查目标容器是否存在
    if ! docker ps -a --filter "name=club-app-$target" | grep -q "club-app-$target"; then
        log_error "Target environment $target does not exist. Cannot rollback."
        return 1
    fi

    # 启动目标环境
    log_info "Starting $target environment..."
    docker compose -f "$COMPOSE_FILE" --profile $target up -d

    # 等待健康检查
    if ! check_health "club-app-$target"; then
        log_error "Rollback failed. $target environment is not healthy."
        return 1
    fi

    # 切换 nginx
    switch_nginx_config "$target"

    # 更新状态
    set_active "$target"

    # 停止当前环境（保留 nginx）
    log_info "Stopping $current environment..."
    docker stop "club-app-$current" 2>/dev/null || true
    docker rm "club-app-$current" 2>/dev/null || true

    log_success "Rollback complete. $target environment is now active."
}

# 手动切换
switch() {
    local current=$(get_active)
    local target

    if [ "$current" == "blue" ]; then
        target="green"
    elif [ "$current" == "green" ]; then
        target="blue"
    else
        log_error "Unknown state: $current"
        return 1
    fi

    log_info "Switching from $current to $target..."

    # 检查目标是否健康
    if ! docker ps --filter "name=club-app-$target" --filter "health=healthy" | grep -q "club-app-$target"; then
        log_error "Target environment $target is not running or healthy."
        return 1
    fi

    switch_nginx_config "$target"
    set_active "$target"

    log_success "Switched to $target environment."
}

# 切换 nginx 配置
switch_nginx_config() {
    local target=$1
    local conf_dir="$PROJECT_DIR/nginx/conf.d"
    local conf_file="$conf_dir/upstream.conf"

    mkdir -p "$conf_dir"

    cat > "$conf_file" << EOF
upstream active {
    server app-$target:3000;
}
EOF

    # 重载 nginx
    if docker ps --filter "name=club-nginx" | grep -q "club-nginx"; then
        docker exec club-nginx nginx -s reload
        log_info "Nginx configuration reloaded"
    fi
}

# 显示状态
status() {
    echo ""
    echo "======================================"
    echo "       Blue-Green Deployment Status"
    echo "======================================"
    echo ""

    local active=$(get_active)
    echo -e "Active Environment: ${GREEN}$active${NC}"
    echo ""

    echo "Containers:"
    echo "--------------------------------------"

    # Blue 状态
    local blue_status=$(docker ps -a --filter "name=club-app-blue" --format "{{.Status}}" 2>/dev/null || echo "Not found")
    local blue_health=$(docker inspect --format='{{.State.Health.Status}}' club-app-blue 2>/dev/null || echo "N/A")
    echo -e "Blue:  Status=$blue_status, Health=$blue_health"

    # Green 状态
    local green_status=$(docker ps -a --filter "name=club-app-green" --format "{{.Status}}" 2>/dev/null || echo "Not found")
    local green_health=$(docker inspect --format='{{.State.Health.Status}}' club-app-green 2>/dev/null || echo "N/A")
    echo -e "Green: Status=$green_status, Health=$green_health"

    # Nginx 状态
    local nginx_status=$(docker ps -a --filter "name=club-nginx" --format "{{.Status}}" 2>/dev/null || echo "Not found")
    echo -e "Nginx: Status=$nginx_status"

    echo ""
}

# 显示帮助
show_help() {
    echo "Blue-Green Deployment Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  init      Initialize blue-green deployment (starts blue environment)"
    echo "  deploy    Deploy new version to inactive environment and switch"
    echo "  rollback  Rollback to the other environment"
    echo "  switch    Manually switch between blue and green"
    echo "  status    Show current deployment status"
    echo "  help      Show this help message"
    echo ""
}

# 主入口
case "${1:-help}" in
    init)
        init
        ;;
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    switch)
        switch
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac