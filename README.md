# Agent Board Frontend

基于 Vue 3 + TypeScript 的待办任务与 Agent 助手前端，提供任务管理、四象限、番茄钟与多轮对话等能力。

## 功能概览

- ✅ 待办任务：新增、完成、编辑、删除
- 📅 日期视图：今天 / 近 7 天 / 全部 / 逾期提示
- 📋 清单管理：收集箱与分组
- 🤖 Agent 助手：多轮对话、快捷指令、上下文展示
- ⚡ 快捷解析：输入自然语言快速建任务
- 🗂️ 四象限：重要/紧急优先级管理
- ⏲️ 番茄钟：专注计时与统计
- 🚀 响应式：桌面与移动端可用

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia

## 目录结构

```
agent-board-frontend/
├── src/
│   ├── api/            # 接口封装
│   ├── components/     # 组件
│   ├── router/         # 路由
│   ├── stores/         # 状态管理
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产包

```bash
npm run build
```

### 预览生产包

```bash
npm run preview
```

## 配置说明

### 接口代理

开发时通过 Vite 代理到后端网关，修改 `vite.config.ts` 中的代理地址即可。

### 环境变量

如需区分环境，可在根目录新增 `.env`、`.env.development`、`.env.production`。

## 核心模块

- 任务管理：任务的创建、编辑、完成、删除、分组显示
- Agent 面板：多轮对话、上下文摘要、快捷指令
- 四象限：可视化任务优先级
- 番茄钟：专注计时与统计

## 与后端交互

- 前端默认通过网关访问后端接口
- 网关默认地址：`http://localhost:8080`
- 建议本地开发使用 Vite 代理，避免跨域

## 开发建议

- 新功能尽量以组件为单位拆分
- 全局状态统一使用 Pinia 管理
- API 统一在 `src/api/` 维护
- 类型定义放在 `src/types/`，减少隐式 any

## 常见问题

1. **接口 404**
   - 确认网关服务已启动
   - 检查 Vite 代理地址是否正确

2. **跨域错误**
   - 优先使用 Vite 代理
   - 或在后端网关开启 CORS

## 许可证

本项目仅供学习和研究使用。
