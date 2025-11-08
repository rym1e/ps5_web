# PS5 Reservation Project Handbook

> 本文面向同时负责 Web 前端与 Go (Gin) 后端的开发同学，集中整理当前仓库内的前端源码说明与后端实现规范。请在开始编码或重构前完整阅读，以便快速掌握目录结构、关键模块职责、接口契约以及部署策略。

---

## 目录

1. [前端（frontend/）源码速查](#前端frontend源码速查)
   1. [目录概览](#目录概览)
   2. [入口与全局框架](#入口与全局框架)
   3. [页面（pages/）职责](#页面pages职责)
   4. [通用组件（components/）](#通用组件components)
   5. [状态管理（store/）](#状态管理store)
   6. [服务层与模拟数据（services/）](#服务层与模拟数据services)
   7. [工具函数与样式](#工具函数与样式)
   8. [构建与工程配置](#构建与工程配置)
2. [后端（Go + Gin）开发指引](#后端go--gin开发指引)
   1. [目标与架构](#目标与架构)
   2. [项目结构建议（CLD 分层）](#项目结构建议cld-分层)
   3. [配置、日志与启动流程](#配置日志与启动流程)
   4. [环境依赖与本地开发流程](#环境依赖与本地开发流程)
   5. [数据库模型](#数据库模型)
   6. [API 设计与错误码](#api-设计与错误码)
   7. [业务流程细化](#业务流程细化)
   8. [安全与合规要求](#安全与合规要求)
   9. [测试策略](#测试策略)
   10. [部署与运维](#部署与运维)
   11. [与前端的联调约定](#与前端的联调约定)
   12. [后续可扩展方向](#后续可扩展方向)

---

## 前端（frontend/）源码速查

### 目录概览

当前前端以 Vite + Vue 3（组合式 API）为基础，并辅以 Pinia、Vue Router、UnoCSS。核心结构如下：

```
frontend/
├── index.html             # SPA 入口模板
├── package.json           # npm/pnpm 依赖与脚本
├── vite.config.js         # Vite 构建配置
├── uno.config.ts          # UnoCSS 原子化样式预设
└── src/
    ├── main.js            # 启动入口，挂载全局插件
    ├── App.vue            # 根组件，负责全局布局
    ├── router/            # 路由定义
    ├── pages/             # 业务页面
    ├── components/        # 复用组件（含系统组件）
    ├── store/             # Pinia 状态管理
    ├── services/          # API 封装（当前为 mock）
    ├── utils/             # 工具函数（时间、Toast）
    └── styles/            # 全局 CSS
```

### 入口与全局框架

- `frontend/index.html`：定义根节点 `<div id="app">`，并通过 `<script type="module">` 引入 `src/main.js`。
- `frontend/src/main.js`：创建 Vue 应用，注册 Pinia 与 Vue Router，并加载 UnoCSS、Reset 与 `styles/global.css`。【F:frontend/src/main.js†L1-L13】
- `frontend/src/App.vue`：确定全局骨架，嵌入 `AppHeader`、`AppFooter` 与全局 `ToastHost`，中间通过 `<RouterView />` 渲染当前页面。【F:frontend/src/App.vue†L1-L16】

### 页面（pages/）职责

| 页面文件 | 路径 | 核心职责 | 关键依赖 |
| --- | --- | --- | --- |
| `ReservationPage.vue` | `src/pages/ReservationPage.vue` | 展示未来 72 小时时段，校验未完成订单，上报新预约。 | `SlotGrid`、`AlertBanner`、Pinia `slots/orders/settings/auth`、Vue Router |【F:frontend/src/pages/ReservationPage.vue†L1-L62】【F:frontend/src/pages/ReservationPage.vue†L64-L96】
| `PayPage.vue` | `src/pages/PayPage.vue` | 显示订单信息、二维码、倒计时，收集支付凭证并提交。 | `Countdown`、`ProofUploader`、`EmptyState`、`useToast`、Pinia 订单仓库 |【F:frontend/src/pages/PayPage.vue†L1-L73】【F:frontend/src/pages/PayPage.vue†L75-L149】
| `OrdersPage.vue` | `src/pages/OrdersPage.vue` | 我的订单列表、状态筛选、取消待支付订单、跳转至详情/支付。 | `StatusTag`、`EmptyState`、Pinia 订单仓库 |【F:frontend/src/pages/OrdersPage.vue†L1-L61】【F:frontend/src/pages/OrdersPage.vue†L63-L111】
| `OrderDetailPage.vue` | `src/pages/OrderDetailPage.vue` | 展示预约、支付、凭证详情及操作入口。 | `StatusTag`、`EmptyState`、时间格式化工具 |【F:frontend/src/pages/OrderDetailPage.vue†L1-L68】【F:frontend/src/pages/OrderDetailPage.vue†L70-L108】
| `NotFoundPage.vue` | `src/pages/NotFoundPage.vue` | 兜底 404，提供返回首页链接。 | `EmptyState` |【F:frontend/src/pages/NotFoundPage.vue†L1-L9】

路由在 `src/router/index.js` 中以懒加载形式注册，路径与上表一一对应，默认使用 HTML5 History 模式。【F:frontend/src/router/index.js†L1-L34】

### 通用组件（components/）

1. **布局组件**
   - `AppHeader.vue`：顶栏导航，提供首页/订单页路由入口。【F:frontend/src/components/AppHeader.vue†L1-L13】
   - `AppFooter.vue`：底部版权与支付提示文案。【F:frontend/src/components/AppFooter.vue†L1-L12】

2. **业务组件**
   - `SlotGrid.vue`：渲染 72 小时内的整点按钮，支持单选、状态标识（可预约/已占用/我的预约）。【F:frontend/src/components/SlotGrid.vue†L1-L58】
   - `Countdown.vue`：根据传入的 `expireAt` 计算剩余时间，倒计时结束触发 `expire` 事件。【F:frontend/src/components/Countdown.vue†L1-L45】
   - `ProofUploader.vue`：凭证缩略图列表 + 上传/删除操作，占位按钮遵循数量与大小限制。【F:frontend/src/components/ProofUploader.vue†L1-L40】
   - `StatusTag.vue`：根据订单状态返回对应的徽章颜色，复用于列表和详情。【F:frontend/src/components/StatusTag.vue†L1-L27】
   - `EmptyState.vue`：空状态占位，默认提示“暂无数据”。【F:frontend/src/components/EmptyState.vue†L1-L6】

3. **系统组件**
   - `components/system/AlertBanner.vue`：信息/警告/危险三种主题的提醒条。【F:frontend/src/components/system/AlertBanner.vue†L1-L19】
   - `components/system/ToastHost.vue`：读取 `useToast` 状态，在右上角展示全局提示并带淡入淡出动画。【F:frontend/src/components/system/ToastHost.vue†L1-L33】

### 状态管理（store/）

Pinia Store 统一采用组合式写法，支持组合调用：

| Store | 职责 | 关键状态 | 主要方法 |
| --- | --- | --- | --- |
| `auth.js` (`useAuthStore`) | 模拟登录、管理 Token 与用户信息。 | `token`、`user`、`loading` | `ensureLogin()` 异步登录、`logout()` 清理状态。【F:frontend/src/store/auth.js†L1-L31】 |
| `slots.js` (`useSlotsStore`) | 维护预约时段列表，创建预约后刷新缓存。 | `slots`、`loading` | `fetchSlots()`、`createReservation(startTime)`。【F:frontend/src/store/slots.js†L1-L27】 |
| `orders.js` (`useOrdersStore`) | 管理订单列表、当前详情、未完成订单缓存。 | `orders`、`currentOrder`、`pendingOrder` | `fetchList()`、`fetchDetail(id)`、`cancel(id)`、`submitProof(id, files, note)`、`fetchPending()`。【F:frontend/src/store/orders.js†L1-L47】 |
| `settings.js` (`useSettingsStore`) | 拉取占位时间、单价、收款二维码等配置。 | `holdMinutes`、`pricePerHour`、`payQrUrl` | `fetchSettings()`。【F:frontend/src/store/settings.js†L1-L19】 |

页面在 `onMounted` 阶段依次调用 `ensureLogin`、`fetchSettings`、`fetchSlots` 等方法，保证进入页面即拉取最新数据。【F:frontend/src/pages/ReservationPage.vue†L64-L96】

### 服务层与模拟数据（services/）

目前服务层仍使用模拟实现，便于无后端情况下演示 UI 行为：

- `services/http.js`：封装 `fetch`，预留 `VITE_API_BASE_URL` 支持未来真实接口。返回非 2xx 时抛出包含后端错误信息的异常。【F:frontend/src/services/http.js†L1-L20】
- `services/auth.js`：`loginWithMock()` 固定返回示例用户与 token。【F:frontend/src/services/auth.js†L1-L11】
- `services/slots.js`：在本地生成 72 个时段，随机标记部分不可用；创建预约时写入 `mockedOrder` 并通过 `appendOrderMock` 推送到订单列表。【F:frontend/src/services/slots.js†L1-L53】
- `services/orders.js`：维护内存订单数组，实现列表、详情、取消、提交凭证等操作。`submitProofMock` 会使用 `URL.createObjectURL` 模拟上传结果，并将状态置为 `proof_submitted`。【F:frontend/src/services/orders.js†L1-L43】
- `services/settings.js`：返回默认配置（15 分钟保留、0 元预售、占位二维码）。【F:frontend/src/services/settings.js†L1-L7】

> 接入真实后端时，可保留同名函数并将内部实现切换为 `http.request('/api/...')` 调用，以保持页面/Store 调用接口不变。

### 工具函数与样式

- `utils/time.js`：封装 ISO 转换、加小时、时间范围/日期格式化等工具，前端页面统一使用该模块保证展示一致性。【F:frontend/src/utils/time.js†L1-L20】
- `utils/toast.js`：基于 `reactive` 实现的轻量全局 Toast，`ToastHost` 组件通过 `useToast()` 读取状态并渲染提示。【F:frontend/src/utils/toast.js†L1-L23】
- `styles/global.css`：全局字体、背景、链接等基础样式；其余样式通过 UnoCSS 原子类组合完成。【F:frontend/src/styles/global.css†L1-L16】

### 构建与工程配置

- `package.json`：定义依赖、`pnpm dev`（启动 Vite）、`pnpm build`（构建）等脚本。
- `.eslintrc.cjs`（位于 `frontend/` 根目录）：提供基础 ESLint + Vue 插件配置。
- `vite.config.js`：启用 Vue 插件、设定别名，可扩展代理配置对接后端 API。【F:frontend/vite.config.js†L1-L11】
- `uno.config.ts`：配置 UnoCSS 主题颜色（如 `brand-primary`、`brand-success` 等），与组件 class 中的命名保持一致。【F:frontend/uno.config.ts†L1-L16】

---

## 后端（Go + Gin）开发指引

以下内容在 `backend/README.md` 的基础上补充了更多实操细节，供后续落地 Go 服务时参考。

### 目标与架构

- **核心目标**：围绕单台 PS5 资源提供预约、下单、手动支付核验的 RESTful API；保障用户在 1 分钟内完成登录与下单，管理员可及时核验付款。
- **CLD 分层理念**：完全对齐练习仓库 [rym1e/bluebell](https://github.com/rym1e/bluebell) 的组织方式，以 **Controller → Logic → DAO** 为主轴，配合配置、日志、路由、工具等辅助模块。
  - **Controller 层（controller/）**：接受路由调用，负责参数绑定、业务入口、响应处理，与 `validator` 翻译器结合提供中文错误提示。
  - **Logic 层（logic/）**：承载核心业务规则，聚合多个 DAO 调用并处理事务边界、状态机流转、缓存更新等；保证控制器轻量且可测试。
  - **DAO 层（dao/mysql, dao/redis）**：封装数据库访问细节，统一返回业务需要的数据结构，提供缓存兜底策略。
  - **共享包（pkg/）**：雪花算法、JWT、加密工具等通用能力复用。
  - **配置（setting/）与日志（logger/）**：使用 Viper 加载多环境配置，使用 Zap 统一结构化日志。
  - **路由（router/）与中间件（middleware/）**：集中注册 Gin 路由、JWT 鉴权、限流、恢复、跨域等中间件。
  - **模型与响应（models/, pkg/response/）**：维护数据库模型、请求/响应结构体以及错误码定义。

蓝图如下：外部请求首先进入 `router`，经中间件后调用对应 `controller`，由 `controller` 调用 `logic`，再由 `logic` 协调 `dao` 与 `pkg` 完成业务处理，最终返回统一响应。

### 项目结构建议（CLD 分层）

参考 bluebell 仓库的落地实践，推荐目录如下（如不使用 `cmd/` 目录，可直接在仓库根部放置 `main.go`，文档以 `cmd/server/main.go` 为例）：

```
backend/
├── cmd/
│   └── server/
│       └── main.go            # 程序入口，与文档示例保持一致
├── config/                    # 配置文件模板（config.yaml、config.prod.yaml 等）
├── controller/                # Controller 层：HTTP handler、参数校验
├── dao/
│   ├── mysql/                 # MySQL 访问，包含初始化、CRUD、事务封装
│   └── redis/                 # Redis 访问，缓存热门数据、限流等
├── logic/                     # 业务逻辑层，处理预约、订单、审核流程
├── middleware/                # JWT 鉴权、CORS、日志、限流、Recovery
├── models/                    # 领域模型、数据库结构体、常量枚举
├── pkg/
│   ├── response/              # 统一响应与错误码包装
│   ├── snowflake/             # 雪花算法 ID 生成
│   ├── jwt/                   # Token 生成/解析
│   └── utils/                 # 通用工具，如时间、密码、上传
├── router/                    # Gin 路由注册，与 Controller 对应
├── setting/                   # Viper 配置加载、结构体定义
├── logger/                    # Zap 日志初始化、封装
├── tasks/                     # 定时任务（订单过期扫描等）
├── migrations/                # SQL 迁移脚本（up/down）
├── scripts/                   # 辅助脚本，如数据导入、代码生成
└── go.mod / go.sum            # Go Modules 描述
```

> **提示**：`logic` 层严禁直接依赖 `controller`，保持单向依赖关系；DAO 层也不应该感知上层业务，专注于数据读写。

### 配置、日志与启动流程

- **Viper 配置加载（setting 包）**
  - `setting/config.go` 定义全局 `Conf` 结构体，与 YAML/JSON 中的字段一一对应（如 `App`, `Log`, `MySQL`, `Redis`, `Snowflake`）。
  - `Init()` 函数读取 `APP_ENV` 环境变量（默认为 `dev`），拼接配置文件名：`config.dev.yaml`、`config.prod.yaml` 等，并支持通过 `--config` 自定义路径。
  - 使用 `viper.SetConfigFile` / `SetConfigName` + `AddConfigPath` 加载，再通过 `viper.Unmarshal` 填充结构体；同时 `viper.WatchConfig` 监听热更新需求。
  - 常见配置段示例：

    ```yaml
    app:
      mode: "dev"
      port: 8080
    log:
      level: "debug"
      filename: "logs/server.log"
      max_size: 128
      max_age: 7
      max_backups: 10
    mysql:
      host: "127.0.0.1"
      port: 3306
      user: "root"
      password: "secret"
      dbname: "ps5_reservation"
      max_open_conns: 50
      max_idle_conns: 10
    redis:
      addr: "127.0.0.1:6379"
      db: 0
      password: ""
    snowflake:
      start_time: "2024-01-01"
      machine_id: 1
    ```

- **Zap 日志（logger 包）**
  - `logger/logger.go` 提供 `Init(cfg *setting.LogConfig, mode string)`，根据配置初始化 Zap，区分 `dev`（控制台彩色日志）与 `prod`（JSON + 文件滚动）。
  - 使用 `zapcore.AddSync` + `lumberjack`（或自定义 hook）实现日志切割；设置全局 logger：`zap.ReplaceGlobals(logger)` 并返回 `*zap.Logger`。
  - 在业务代码中通过 `zap.L().Info/Debug/Error` 记录关键日志，附带 `zap.String("order_no", ...)` 等字段。

- **main.go 启动顺序**
  - 与用户提供的示例一致，`init()` 确保 `APP_ENV` 默认值；`main()` 依次执行：
    1. `setting.Init()`：加载配置到全局 `Conf`。
    2. `logger.Init(&setting.Conf.LogConfig, setting.Conf.App.Mode)`：初始化 Zap。
    3. `mysql.Init(setting.Conf.MySQLConfig)`、`redis.Init(setting.Conf.RedisConfig)`：完成数据库连接。
    4. `snowflake.Init(setting.Conf.StartTime, setting.Conf.MachineID)`：准备 ID 生成器。
    5. `controller.InitTrans("zh")`：注册验证器中文翻译。
    6. `router.Setup(setting.Conf.App.Mode)`：组装 Gin 路由（含中间件）。
    7. `http.Server` 优雅启动，监听 `Conf.App.Port`，并使用 `os/signal` + `context.WithTimeout` 优雅关闭。
  - 关键错误统一使用 `zap.L().Fatal/Info` 输出，必要时 `panic`；`defer mysql.Close()`、`defer redis.Close()` 保证资源释放。


### 环境依赖与本地开发流程

1. **运行时**：
   - Go 1.22+，启用模块模式。
   - MySQL 8.0+（字符集 `utf8mb4`、时区 `+08:00`）。
   - （可选）Redis 用于会话/限流，MVP 阶段非必需。

2. **推荐工具链**：
   - `golangci-lint`：多合一静态检查，配合 CI 执行 `golangci-lint run ./...`。
   - `air` 或 `reflex`：本地热重载开发。
   - `migrate` (`github.com/golang-migrate/migrate/v4`)：数据库迁移。

3. **配置项**：采用环境变量 + `.env` 管理，核心包括：

   | 变量 | 示例值 | 说明 |
   | --- | --- | --- |
   | `APP_ENV` | `development`/`production` | 控制日志级别、CORS 等。 |
   | `HTTP_ADDR` | `:8080` | Gin 监听地址。 |
   | `MYSQL_DSN` | `user:pass@tcp(localhost:3306)/ps5_reservation?parseTime=true&loc=Asia%2FShanghai` | 数据库连接串。 |
   | `JWT_SECRET` | 随机 32 字节 | 用户 JWT 签名密钥。 |
   | `JWT_TTL` | `24h` | Token 有效期。 |
   | `WECHAT_APPID/WECHAT_SECRET` | - | 微信登录凭据或替代 OAuth 信息。 |
   | `PAY_QR_URL` | CDN 链接 | 默认收款二维码。 |
   | `HOLD_MINUTES` | `15` | 预约占位时长。 |
   | `PRICE_PER_HOUR` | `0` | 单小时价格（分）。 |
   | `UPLOAD_BUCKET` | `ps5-proof` | 凭证图存储桶名称。 |

4. **本地启动流程**：
   1. `cp .env.example .env` 并填写变量。
   2. `make db-up`（可选，使用 docker-compose 提供 MySQL）。
   3. `make migrate-up` or `go run ./cmd/server migrate up` 应用迁移。
   4. `go run ./cmd/server` 启动 HTTP 服务。
   5. 使用 `curl`/`Insomnia`/`Hoppscotch` 验证接口，或直接联调前端。

### 数据库模型

数据库结构遵循需求文档（均为 `BIGINT UNSIGNED AUTO_INCREMENT` 主键）：

- `users`：存储登录用户的 openid/unionid、昵称、头像。
- `reservations`：维护时段占用信息，唯一索引 `UNIQUE (start_time)` 保证单台设备同一整点仅一条记录。
- `orders`：与预约一一对应，记录金额、状态、过期时间。
- `payment_proofs`：支付凭证（图片 URL + 备注）。
- `admins`（可选）：后台账号。
- `settings`（可选）：存储单价、占位时间、二维码等动态配置。

在实现层面建议：

- 使用 `ENUM` 或 TINYINT + 常量映射管理状态机，避免 Magic String。
- 所有时间字段采用 `DATETIME(3)` 存储毫秒精度，配合 `time.Time`。
- 设置常用索引：`orders(user_id, status)`、`reservations(start_time)` 等。

### API 设计与错误码

#### 主要 REST 接口

| Method | Path | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/wechat/login` | 交换微信 `code` 获取 token；响应 `token` + `user`。 |
| `GET` | `/api/slots?from=now&hours=72` | 返回未来 72 小时的整点时段数组（含 `available`、`mine` 标记）。 |
| `POST` | `/api/reservations` | 参数 `{ start_time }`，原子创建预约+订单，返回订单信息。 |
| `POST` | `/api/orders/{id}/cancel` | 取消待支付订单，释放时段。 |
| `POST` | `/api/orders/{id}/proofs` | Multipart 上传凭证（最多 3 张）与可选备注。 |
| `GET` | `/api/orders` | 当前用户订单列表，支持 `status` 多选过滤、分页。 |
| `GET` | `/api/orders/{id}` | 订单详情，含预约与凭证。 |
| `POST` | `/api/admin/login` | 管理员登录。 |
| `GET` | `/api/admin/orders` | 管理端订单筛选、分页。 |
| `POST` | `/api/admin/orders/{id}/verify` | 审核支付：`{ pass: bool, reason?: string }`。 |
| `GET/POST` | `/api/admin/settings` | 获取或更新价格、占位时长、二维码等配置。 |

#### 错误码建议

| Code | 含义 | HTTP |
| --- | --- | --- |
| `4001` | 时段已被占用或锁定 | 409 |
| `4002` | 用户已有未完成订单 | 409 |
| `4003` | 订单已过期 | 410 |
| `4004` | 无权限操作（Token 失效/角色不足） | 403 |
| `5001` | 内部服务错误（数据库/存储） | 500 |

所有错误响应格式统一为 `{ "code": <int>, "message": "..." }`，前端可直接映射到 Toast 或 Alert。

### 业务流程细化

1. **预约创建**
   - 读取服务器时间并向上取整到下一个整点，验证是否落在 72 小时窗口内。
   - 开启事务：
     1. 查询 `reservations` 是否存在同一时段且状态为 `locked/confirmed`。
     2. 插入 `reservations`（状态 `locked`），插入 `orders`（状态 `pending`、`expire_at = now + hold_minutes`）。
   - 提交事务并返回订单信息（含 `pay_qr_url`、倒计时）。

2. **未完成订单限制**
   - `orders` 表新增查询 `WHERE user_id = ? AND status IN ('pending','proof_submitted')`。
   - 如果存在记录，在 `POST /api/reservations` 中返回错误码 `4002`。

3. **支付凭证上传**
   - Gin Handler 使用 `multipart/form-data` 解析文件，校验数量、大小、类型。
   - 上传至对象存储后，将 URL 记录到 `payment_proofs`，并更新 `orders.status = 'proof_submitted'`。

4. **管理员审核**
   - 审核通过：更新 `orders.status = 'paid'`、`reservations.status = 'confirmed'`，写入审核日志（可建 `order_audits` 表）。
   - 审核驳回：写入 `orders.status = 'rejected'` 并附带 `reason`，可选回退到 `pending` 允许重新上传。

5. **过期释放**
   - 定时任务 `jobs/expiration` 每分钟扫描 `expire_at < now` 且状态 `pending/proof_submitted` 的订单，批量更新为 `expired` 并释放 `reservations`。
   - 前端收到 `expired` 状态应提示用户重新预约（现有 `PayPage` 已在倒计时结束时自动跳转）。【F:frontend/src/pages/PayPage.vue†L99-L110】

### 安全与合规要求

- **鉴权**：
  - 用户端使用 Bearer Token；Gin 中编写 `AuthMiddleware` 验证 JWT 并注入 `user_id`。
  - 管理端建议独立域名或前缀，使用 session/JWT + CSRF 保护。
- **输入验证**：使用 `binding` 标签和自定义校验器（如 `start_time` 必须为整点）。
- **文件安全**：限制 MIME、大小；生产环境建议结合云存储回调或内容安全检测。
- **日志审计**：管理员操作需记录 `admin_id`、订单号、动作、备注、时间。
- **通知文案**：支付页需提示“个人收款二维码，需人工核验”，前端已在 `AppFooter` 内显示。【F:frontend/src/components/AppFooter.vue†L1-L12】

### 测试策略

1. **单元测试**：
   - Service 层：预约创建、取消、状态迁移、过期逻辑。
   - Utility：时间处理、订单号生成、配置解析。

2. **集成测试**：
   - 使用 `net/http/httptest` 启动 Gin，配合内存 MySQL（或 Docker）完成黑盒测试。
   - 针对关键接口（预约冲突、支付凭证上传）编写正/反向用例。

3. **端到端（E2E）**：
   - 待后端完成后，可通过 Playwright/Cypress 驱动前端执行：登录 → 预约 → 上传凭证 → 管理员审核。

4. **静态检查 & CI**：
   - 配置 GitHub Actions 执行 `go test ./...`、`golangci-lint run`、`sqlc`（若使用）等。

### 部署与运维

- **构建**：
  - `GOOS=linux GOARCH=amd64 go build -o bin/server ./cmd/server`。
  - 推荐使用多阶段 Dockerfile（build stage + runtime stage），基础镜像 Alpine/Debian 均可。

- **部署**：
  - 单实例部署在云主机或容器平台，前置 Nginx/Caddy 做 HTTPS、静态前端托管与反向代理。
  - 配置健康检查：`/healthz`（检查 DB）、`/readyz`（检查迁移/依赖）。

- **运维**：
  - 日志输出 JSON，包含 `request_id`、用户/管理员 ID。
  - 监控指标：HTTP QPS、错误率、预约/支付状态分布。
  - 备份：每日导出数据库（`mysqldump`），并将上传凭证同步到对象存储快照。

### 与前端的联调约定

- 前端所有请求统一挂载 `Authorization: Bearer <token>`，若返回 `401`，`auth store` 将触发重新登录流程。【F:frontend/src/store/auth.js†L1-L31】
- API 返回的字段应与 mock 对齐：
  - Slot 对象：`{ start_time, end_time, available, mine }`。【F:frontend/src/components/SlotGrid.vue†L1-L33】
  - Order 对象：`{ id, order_no, amount, status, start_time, end_time, created_at, updated_at, expire_at?, pay_qr_url?, proofs? }`。【F:frontend/src/services/orders.js†L1-L39】
  - Settings：`{ hold_minutes, price_per_hour, pay_qr_url }`。【F:frontend/src/services/settings.js†L1-L7】
- 错误响应 `code` + `message` 即可映射到前端 Toast/Alert，不需要复杂错误体。
- 上传接口建议返回最新 `order` 对象，以便前端刷新状态并重新渲染凭证列表。【F:frontend/src/pages/PayPage.vue†L123-L145】

### 后续可扩展方向

- **多设备/多时段**：扩展 `reservations` 增加 `capacity` 字段，允许同一整点多份预约；前端 SlotGrid 可显示剩余数量。
- **运营与通知**：加入短信/邮件/微信订阅消息提醒预约成功、即将开始、驳回原因。
- **支付集成升级**：若接入平台支付，可在订单生成后跳转官方支付网关，减少人工核验。
- **权限与审计**：为管理员增加角色（客服/运营），拆分接口权限，并在后台提供审计日志查询。
- **监控面板**：通过 Grafana/Prometheus 构建预约量、转化率、核验耗时等指标看板。

---

如需更新本手册，请在合并代码前同步修改，确保团队成员对最新结构与约定保持一致。
