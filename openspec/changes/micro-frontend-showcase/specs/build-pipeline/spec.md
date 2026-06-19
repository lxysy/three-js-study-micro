## ADDED Requirements

### Requirement: Type A 构建
系统 SHALL 将所有 Type A（importmap）项目处理为可部署的静态文件。

#### Scenario: 构建 Type A
- **WHEN** 运行 Type A 构建
- **THEN** 脚本遍历所有 Type A 项目
- **THEN** 复制 HTML、JS、CSS 和 public 资源到 `public/demos/<name>/`
- **THEN** 重写 importmap 指向共享依赖

### Requirement: Type B 构建
系统 SHALL 将所有 Type B（Vite）项目构建到统一输出目录。

#### Scenario: 构建 Type B
- **WHEN** 运行 Type B 构建
- **THEN** 脚本遍历所有 Type B 项目
- **THEN** 在每个项目目录中执行 `vite build`，配置输出到 `../public/demos/<name>/`
- **THEN** 构建失败的 demo 被记录但不会中断整体构建

#### Scenario: 并行构建
- **WHEN** 运行 Type B 构建
- **THEN** 多个 Vite 构建进程并行执行
- **THEN** 并行数不超过 CPU 核心数

### Requirement: 一键构建
系统 SHALL 提供 `npm run build` 命令，一次性完成所有构建步骤。

#### Scenario: 完整构建流程
- **WHEN** 运行 `npm run build`
- **THEN** 依次执行：prepare-registry → shared-deps → build-type-a → build-type-b → vite build shell
- **THEN** 最终产出 `dist/` 目录，可直接部署
