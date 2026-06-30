# Logistics AI ERP V3

Logistics AI ERP V3 是一个可直接运行和上线的企业级进销存 + 财务 + AI 商品识别系统，采用 Vue 3 + Vite + Element Plus 前端，Node.js + Express 后端，Supabase PostgreSQL 数据库，以及 OpenAI 兼容接口完成商品标准化识别。

## 项目结构

```text
.
├─ package.json            # 根脚本
├─ client/                 # Vue3 + Vite + Element Plus 前端
├─ server/                 # Express + Supabase + OpenAI 后端
├─ supabase/
│  └─ init.sql             # 数据库初始化 SQL
└─ README.md
```

## 已实现能力

- 快递扫码入库，自动调用 AI 标准化商品
- 订单总表搜索、筛选、状态流转
- 严格状态流：`待入库 -> 已入库 -> 待收款 -> 已收款 -> 待打款 -> 已完成`
- 待打款按姓名分组汇总并可复制打款明细
- 库存自动重算：`stock_qty = qty - sold_qty`
- 财务自动重算：总收入、总成本、待收款、待打款、利润
- 商品 AI 匹配库维护
- CSV 导入/导出
- 所有关键操作落日志
- 可部署到 Vercel（前端）+ Render（后端）+ Supabase（数据库）

## 本地运行

### 1. 初始化数据库

在 Supabase SQL Editor 中执行：

`supabase/init.sql`

### 2. 配置后端环境变量

复制 `server/.env.example` 为 `server/.env`，填入真实值。

### 3. 配置前端环境变量

复制 `client/.env.example` 为 `client/.env`，填入后端地址。

### 4. 安装并启动后端

```bash
cd server
npm install
npm run dev
```

默认运行在 `http://localhost:3000`

### 5. 安装并启动前端

```bash
cd client
npm install
npm run dev
```

默认运行在 `http://localhost:5173`

### 6. 一键安装与构建

在项目根目录可直接运行：

```bash
npm run install:all
npm run build:client
```

## 环境变量

### 后端 `server/.env`

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_PROVIDER=library
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=http://localhost:5173
```

### 前端 `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

## API 概览

- `POST /ai/match`
- `POST /scan`
- `GET /orders`
- `POST /update-status`
- `GET /inventory`
- `GET /finance`
- `POST /import-csv`
- `GET /export-csv`
- `GET /payables`
- `GET /product-library`
- `POST /product-library`
- `PUT /product-library/:id`
- `DELETE /product-library/:id`

## 部署说明

### 前端部署到 Vercel

1. 导入仓库到 Vercel
2. Root Directory 设为 `client`
3. Build Command 使用 `npm run build`
4. Output Directory 使用 `dist`
5. 配置环境变量：

```env
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

### 后端部署到 Render

1. 在 Render 新建 Web Service
2. Root Directory 设为 `server`
3. Build Command：

```bash
npm install
```

4. Start Command：

```bash
npm start
```

5. 配置环境变量：

```env
PORT=10000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### Supabase

1. 创建项目
2. 执行 `supabase/init.sql`
3. 从 Project Settings -> API 获取：
   - `Project URL`
   - `service_role key`

## CSV 导入格式

建议表头：

```csv
name,phone,tracking_number,product_raw,status,amount,cost,remark
张三,13800138000,SF1001,Apple Watch S9 45mm,已入库,,,
李四,13900139000,YT2002,iPhone 15 Pro Max,待收款,6999,6200,二次确认
```

如果 `amount`、`cost` 或 `product_standard` 缺失，系统会自动调用 AI 或商品库规则进行补齐。

## 业务说明

- 所有业务数据统一进入 `orders`
- 商品识别优先走 OpenAI，失败时回退到商品库关键词匹配
- 默认 `AI_PROVIDER=library`，不会调用 OpenAI，也不会消耗你的 API token；只有显式改成 `openai` 才会走 OpenAI
- 每次订单创建、状态更新、CSV 导入后，系统都会自动重算库存与财务汇总
- 日志表 `logs` 会记录关键动作和上下文
- 前端已做移动端菜单适配，可在手机浏览器或添加到主屏后使用
