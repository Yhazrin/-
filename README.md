# Monument Valley 风格长期生态模拟框架

这是一个 **TypeScript 生态模拟框架**，用于实现你提出的「3D WebGL 纪念碑谷风格 AI 模拟生态系统」的核心执行内核：

- 任务队列驱动（每个生命周期阶段都进入 Queue）
- 行为树 + Q-Learning 生物行为
- 长期运行调优钩子（Optimizer）
- 自动化测试覆盖（Vitest + 覆盖率）

> 当前仓库聚焦“可长期演化的模拟内核”，渲染层（Three.js/WebGL UI）可以在此基础上扩展接入。

## 快速开始

```bash
npm install
npm test
npm run build
```

## 目录结构

```text
src/
├── ai/
│   ├── behaviorTree.ts
│   └── qLearningAgent.ts
├── core/
│   ├── EcosystemManager.ts
│   ├── Optimizer.ts
│   ├── SimulationRuntime.ts
│   └── TaskQueue.ts
├── entities/
│   ├── EcosystemEntity.ts
│   ├── Plant.ts
│   ├── Predator.ts
│   └── Neutral.ts
├── visual/
│   └── designSystem.ts
└── types/
    └── math.ts

tests/
└── *.test.ts
```

## 设计要点

### 1) 任务队列执行

`EcosystemManager` 每个 tick 会把以下任务按优先级入队并执行：

1. `update-entities`
2. `handle-reproduction`
3. `handle-deaths`
4. `spawn-energy`
5. `optimize`

这保证了你要求的“每个任务队列方式执行”。

### 2) 行为系统

- `BehaviorTree` 提供 `Selector/Sequence/Condition/Action` 节点
- `Predator` 内置 `QLearningAgent`，在 `hunt/search/rest` 间进行探索和利用
- `Plant` 与 `Neutral` 使用行为树驱动生长与社交/探索

### 3) 自动调优

`EcosystemOptimizer` 读取当前统计数据并给出调优建议：

- `spawnPlantBoost`
- `predatorEnergyDecayMultiplier`
- `neutralCuriosityBoost`

并在每个生命周期周期自动更新，支撑“不断调优”。

### 4) 测试策略

已覆盖：

- 任务队列优先级执行
- Q-Learning 值更新
- 行为树组合语义
- 生态系统初始化/更新/增删实体
- Runtime 批量执行

## 下一步接入建议（WebGL 层）

1. 在前端项目中引用本框架的 `EcosystemManager` 和 `SimulationRuntime`。
2. 用 Three.js Mesh 映射实体类型：
   - Predator → Pyramid/Cone
   - Plant → Sphere
   - Neutral → Cube
3. 每帧读取实体状态同步到场景节点。
4. 引入你的 Morandi 调色板与自定义 shader 材质。

