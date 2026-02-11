# Monument Valley 风格长期生态模拟框架（持续开发版）

这个仓库提供一个**长期运行、可调优、任务队列驱动**的生态模拟内核，便于后续接入 Three.js/WebGL 渲染层。

## 当前能力

- ✅ 生命周期任务队列（按优先级调度）
- ✅ 行为树（Selector/Sequence/Condition/Action）
- ✅ Q-Learning 捕食者（探索-利用 + 衰减）
- ✅ 环境循环（昼夜 + 四季）
- ✅ 遗传特征与变异（speed/efficiency/resilience）
- ✅ 自动调优器（种群压力驱动）
- ✅ 长时运行 Runtime + Tick 历史报告
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
2. `entities:reproduce`
3. `entities:cleanup`
4. `environment:spawn-energy`
5. `system:optimize`

该顺序确保模拟具有稳定可解释性，并支持长周期实验复现。

## 可复现实验（Deterministic）

通过 `seed` 初始化 `EcosystemManager`，可得到确定性初始分布与随机行为序列，便于调参与回归测试。

## 示例

```ts
import { SimulationRuntime } from './dist/index.js';

const runtime = new SimulationRuntime();
runtime.bootstrap({ plants: 10, predators: 4, neutrals: 8, seed: 42 });
const history = runtime.run({ delta: 1 / 30, maxSteps: 3600 });

console.log(history.at(-1));
```

## 后续建议（下一阶段）

1. 将 `EcosystemManager` 状态绑定到 Three.js 实体池（InstancedMesh）。
2. 根据 `season` 和 `lightIntensity` 驱动 shader uniform。
3. 增加事件总线（出生/死亡/捕食）用于 UI 时间线与统计面板。
4. 引入空间分区（Uniform Grid / BVH）优化近邻搜索。
