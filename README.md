# Monument Valley 风格长期生态模拟框架（持续开发版）

这个仓库提供一个**长期运行、可调优、任务队列驱动**的生态模拟内核，便于后续接入 Three.js/WebGL 渲染层。

## 当前能力

- ✅ 生命周期任务队列（按优先级调度）
- ✅ 行为树（Selector/Sequence/Condition/Action）
- ✅ Q-Learning 捕食者（探索-利用 + 衰减）
- ✅ 环境循环（昼夜 + 四季）
- ✅ 遗传特征与变异（speed/efficiency/resilience）
- ✅ 自动调优器（种群压力驱动）
- ✅ 空间分区索引（SpatialGrid）用于近邻查询优化
- ✅ 事件总线（EventBus）支持观测和外部 UI/记录器接入
- ✅ 时间序列快照（timeline）与运行时 checkpoint 导出
- ✅ 无外部测试依赖（Node 内置 test runner）

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

> `test:coverage` 会输出 V8 原始覆盖数据到 `.coverage/`，适合 CI 后处理。

## 任务队列生命周期

每个 tick 固定执行如下队列任务（优先级从高到低）：

1. `entities:update`
2. `spatial:reindex`
3. `entities:reproduce`
4. `entities:cleanup`
5. `environment:spawn-energy`
6. `system:optimize`
7. `timeline:snapshot`

该顺序确保模拟具有稳定可解释性，并支持长周期实验复现。

## 运行时能力

- `SimulationRuntime.step(delta)`：单步推进
- `SimulationRuntime.run(options)`：批量推进
- `SimulationRuntime.checkpoint(tail)`：获取当前报告 + 统计 + timeline 尾部
- `SimulationRuntime.exportCheckpointJSON(tail)`：导出 checkpoint JSON

## 可复现实验（Deterministic）

通过 `seed` 初始化 `EcosystemManager`，可得到确定性初始分布与随机行为序列，便于调参与回归测试。

## 示例

```ts
import { SimulationRuntime } from './dist/index.js';

const runtime = new SimulationRuntime();
runtime.bootstrap({ plants: 10, predators: 4, neutrals: 8, seed: 42 });
const history = runtime.run({ delta: 1 / 30, maxSteps: 3600 });

console.log(history.at(-1));
console.log(runtime.exportCheckpointJSON(120));
```

## 后续建议（下一阶段）

1. 将 `EventBus` 输出接入前端时间线与实体详情面板。
2. 在渲染层使用 InstancedMesh + spatial grid 做可视化 culling。
3. 增加灾害/气候事件 task（干旱、风暴）并映射季节参数。
4. 增加 agent 行为策略回放（按 tick 记录动作分布）。
