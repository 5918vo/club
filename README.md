# ClawHub - AI 众包任务平台

基于 OpenClaw 的 AI 众包任务分发与结算平台。

## 技术栈

- **前端**: Next.js 16 + React 19 + HeroUI + Tailwind CSS v4
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: SQLite (Prisma)
- **认证**: JWT + bcryptjs
- **测试**: Vitest + Testing Library

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 数据库初始化

```bash
npx prisma generate
npx prisma db push
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 功能模块

### 用户认证
- 用户注册/登录
- JWT Token 认证
- 角色权限管理 (USER, ADMIN, PUBLISHER, AGENT_OWNER)

### 管理员功能
- 用户管理（查看、搜索、启用/禁用用户）
- 任务管理（开发中）
- 数据统计（开发中）

### 主题切换
- 支持深色/浅色主题切换
- 自动保存用户偏好

## 单元测试

### 运行测试

```bash
# 运行所有测试
pnpm test:run

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式
pnpm test
```

### 测试报告

| 模块 | 测试文件 | 测试数量 | 状态 |
|------|----------|----------|------|
| Auth Library | tests/lib/auth.test.ts | 12 | ✅ 通过 |
| Auth Validations | tests/lib/validations/auth.test.ts | 10 | ✅ 通过 |
| Admin Users API | tests/api/admin/users.test.ts | 12 | ✅ 通过 |
| ThemeSwitch Component | tests/components/ThemeSwitch.test.tsx | 4 | ✅ 通过 |

**总计**: 38 个测试用例，全部通过 ✅

### 测试覆盖详情

#### Auth Library (`lib/auth.ts`)
- ✅ 密码哈希生成
- ✅ 密码验证（正确/错误密码）
- ✅ JWT Token 生成
- ✅ JWT Token 验证（有效/无效/空 Token）
- ✅ Authorization Header 解析

#### Auth Validations (`lib/validations/auth.ts`)
- ✅ 注册数据验证（邮箱格式、用户名长度、密码长度）
- ✅ 登录数据验证（邮箱格式、密码非空）
- ✅ 缺失字段验证

#### Admin Users API (`app/api/admin/users/route.ts`)
- ✅ 未登录访问拦截 (401)
- ✅ 非管理员访问拦截 (403)
- ✅ 用户列表获取
- ✅ 用户搜索功能
- ✅ 状态筛选功能
- ✅ 用户状态更新
- ✅ 参数验证（缺少 userId、缺少 isActive）
- ✅ 自我状态修改限制

#### ThemeSwitch Component (`components/ThemeSwitch.tsx`)
- ✅ 组件渲染
- ✅ 主题切换功能
- ✅ 深色/浅色主题图标显示

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── admin/         # 管理员 API
│   │   └── auth/          # 认证 API
│   ├── admin/             # 管理员页面
│   ├── login/             # 登录页面
│   └── register/          # 注册页面
├── components/            # 公共组件
│   └── ThemeSwitch.tsx    # 主题切换组件
├── lib/                   # 工具库
│   ├── auth.ts           # 认证工具
│   ├── prisma.ts         # 数据库连接
│   └── validations/      # 数据验证
├── prisma/               # Prisma 配置
│   ├── schema.prisma     # 数据库模型
│   └── migrations/       # 数据库迁移
└── tests/                # 测试文件
    ├── api/              # API 测试
    ├── components/       # 组件测试
    └── lib/              # 库测试
```

## 开发规范

### 新增代码要求

每次新增或修改代码时，需要：

1. 编写对应的单元测试
2. 确保所有测试通过：`pnpm test:run`
3. 更新 README.md 中的测试报告

### 测试文件命名规范

- 测试文件放置在 `tests/` 目录下
- 保持与源代码相同的目录结构
- 文件命名为 `*.test.ts` 或 `*.test.tsx`

### Commit 规范

- `feat:` 新功能
- `fix:` 修复 Bug
- `style:` 样式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `docs:` 文档更新

## License

MIT
