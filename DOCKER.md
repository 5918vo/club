# Docker 部署指南

## 快速开始

### 使用 Docker Compose（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd my-app
```

2. **创建环境变量文件**
```bash
cp .env.example .env
```

编辑 `.env` 文件，设置生产环境变量：
```env
DATABASE_URL="file:/app/data/prod.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

3. **创建数据目录并设置权限**
```bash
mkdir -p data
chmod 777 data
```

4. **启动服务**
```bash
docker-compose up -d
```

5. **查看日志**
```bash
docker-compose logs -f
```

6. **停止服务**
```bash
docker-compose down
```

### 使用 Docker 命令

1. **构建镜像**
```bash
docker build -t openclaw-app .
```

2. **运行容器**
```bash
docker run -d \
  --name openclaw-app \
  -p 3000:3000 \
  -e DATABASE_URL="file:/app/data/prod.db" \
  -e JWT_SECRET="your-super-secret-jwt-key" \
  -v $(pwd)/data:/app/data \
  openclaw-app
```

## 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:/app/data/prod.db` | 是 |
| `JWT_SECRET` | JWT 密钥 | - | 是 |
| `NODE_ENV` | 运行环境 | `production` | 是 |
| `PORT` | 应用端口 | `3000` | 否 |

## 数据持久化

应用使用 SQLite 数据库，数据存储在 `/app/data` 目录。建议使用 Docker Volume 挂载：

```yaml
volumes:
  - ./data:/app/data
```

**重要**：确保数据目录有正确的权限：
```bash
# 创建数据目录
mkdir -p data

# 设置权限（允许容器写入）
chmod 777 data
```

## 生产环境配置

### 1. 安全配置

**修改 JWT_SECRET**
```bash
# 生成随机密钥
openssl rand -base64 32
```

将生成的密钥设置到 `.env` 文件中：
```env
JWT_SECRET="生成的随机密钥"
```

### 2. 反向代理配置（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. HTTPS 配置

使用 Let's Encrypt 和 Certbot：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 健康检查

应用提供健康检查端点：

```bash
curl http://localhost:3000/api/auth/me
```

Docker Compose 配置中已包含健康检查：
- 检查间隔：30 秒
- 超时时间：10 秒
- 重试次数：3 次
- 启动等待：40 秒

## 备份与恢复

### 备份数据库

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库文件
cp data/prod.db backups/prod-$(date +%Y%m%d-%H%M%S).db
```

### 恢复数据库

```bash
# 停止服务
docker-compose down

# 恢复数据库文件
cp backups/prod-20260314-120000.db data/prod.db

# 启动服务
docker-compose up -d
```

## 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 故障排查

### 1. 数据库权限错误

**错误信息**：
```
Error: Schema engine error:
SQLite database error
unable to open database file: /app/data/prod.db
```

**解决方案**：
```bash
# 停止容器
docker-compose down

# 创建数据目录并设置权限
mkdir -p data
chmod 777 data

# 重新启动
docker-compose up -d
```

### 2. 查看容器日志
```bash
docker-compose logs -f app
```

### 3. 进入容器
```bash
docker-compose exec app sh
```

### 4. 检查数据库
```bash
docker-compose exec app npx prisma studio --port 5555
```

### 5. 重启服务
```bash
docker-compose restart
```

### 6. 端口被占用

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:3000"  # 将 3000 改为其他端口
```

### 7. 内存不足

增加 Docker 内存限制或优化应用代码。

## 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 日志管理

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 监控

### 使用 Docker Stats

```bash
docker stats openclaw-app
```

### 使用 Prometheus + Grafana

可以集成 Prometheus 和 Grafana 进行监控：

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 安全建议

1. **定期更新镜像**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **使用非 root 用户**（已在 Dockerfile 中配置）

3. **限制网络访问**
   - 使用防火墙规则
   - 配置 Nginx 白名单

4. **定期备份数据**
   - 设置自动备份脚本
   - 异地备份

5. **监控日志**
   - 检查异常访问
   - 监控错误日志

## 技术支持

如有问题，请查看：
- 应用日志：`docker-compose logs -f`
- 健康检查：`curl http://localhost:3000/api/auth/me`
- 数据库状态：`docker-compose exec app npx prisma studio`
