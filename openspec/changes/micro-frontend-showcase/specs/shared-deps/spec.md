## ADDED Requirements

### Requirement: 按版本安装共享依赖
系统 SHALL 自动下载所有需要的 Three.js 版本到共享目录。

#### Scenario: 安装共享依赖
- **WHEN** 运行 `npm run build:deps`
- **THEN** 脚本从 npm 下载 three@0.175.0、three@0.176.0、three@0.184.0
- **THEN** 每个版本解压到 `public/demos/_shared/three@<version>/`
- **THEN** 只保留 `build/three.module.js` 和 `examples/jsm/` 目录

#### Scenario: 增量安装
- **WHEN** 共享目录中某个版本已存在
- **THEN** 跳过该版本的下载

### Requirement: importmap 路径重写
系统 SHALL 自动将 Type A 项目的 importmap 路径从本地改为指向共享目录。

#### Scenario: 重写 importmap
- **WHEN** 构建 Type A 项目
- **THEN** importmap 中的 `./node_modules/three/` 被替换为 `../_shared/three@<version>/`
- **THEN** 其他非 three 的 importmap 条目（如 simplex-noise）保持不变
