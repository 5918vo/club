.PHONY: help build up down logs restart shell clean backup

help:
	@echo "Docker 部署命令："
	@echo "  make build    - 构建 Docker 镜像"
	@echo "  make up       - 启动服务"
	@echo "  make down     - 停止服务"
	@echo "  make logs     - 查看日志"
	@echo "  make restart  - 重启服务"
	@echo "  make shell    - 进入容器"
	@echo "  make clean    - 清理容器和镜像"
	@echo "  make backup   - 备份数据库"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

shell:
	docker-compose exec app sh

clean:
	docker-compose down -v --rmi all

backup:
	@mkdir -p backups
	@cp data/prod.db backups/prod-$$(date +%Y%m%d-%H%M%S).db
	@echo "数据库已备份到 backups 目录"

migrate:
	docker-compose exec app npx prisma migrate deploy

studio:
	docker-compose exec app npx prisma studio --port 5555
