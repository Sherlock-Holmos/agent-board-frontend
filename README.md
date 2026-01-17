# 待办系统 (Todo Board)

基于 Vue 3 + TypeScript + Element Plus 构建的待办事项管理系统。

## 功能特性

- ✅ 任务管理（添加、完成、删除）
- 📅 按日期分类（今天、最近7天、所有）
- 📋 清单分类（收集箱等）
- 🎨 简洁美观的界面设计
- 🚀 响应式布局

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Element Plus** - Vue 3 组件库
- **Pinia** - 状态管理
- **Vite** - 构建工具

## 项目结构

```
todo-board/
├── src/
│   ├── components/      # 组件
│   │   ├── Sidebar.vue  # 侧边栏导航
│   │   └── MainContent.vue # 主内容区域
│   ├── stores/          # Pinia 状态管理
│   │   └── taskStore.ts
│   ├── types/           # TypeScript 类型定义
│   │   └── task.ts
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── style.css        # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
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

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用说明

1. **添加任务**：在输入框中输入任务标题，按回车键添加
2. **完成任务**：点击任务前的复选框标记为完成
3. **切换视图**：点击左侧导航栏中的不同选项（所有、今天、最近7天、收集箱）
4. **折叠任务组**：点击日期标题旁的箭头图标可折叠/展开任务组

## 界面预览

界面包含以下部分：
- 左侧导航栏：包含图标栏、导航列表、功能说明和底部操作
- 主内容区：任务列表、添加任务输入框、任务分组显示
- 水印背景：页面右下角的装饰性水印图案