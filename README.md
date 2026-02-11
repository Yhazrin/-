# Monument Valley 风格长期生态模拟框架（商用推进版）

这个仓库提供一个**长期运行、可调优、任务队列驱动**的生态模拟内核，并已经进入可商用接入阶段（稳定调度、容错桥接、运行指标）。

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
- ✅ 渲染桥接层（RenderBridge + RenderFrame + RendererAdapter）
- ✅ Three.js 实例写入适配器（ThreeAdapter + ThreeInstancedTarget）
- ✅ 商用运行控制（固定步长、配置校验、历史上限、运行指标）
- ✅ 无外部测试依赖（Node 内置 test runner）

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

## 商用级运行特性

- `validateRuntimeConfig`：防止无效参数进入生产运行时
- `FixedStepRunner`：真实时间输入下的固定步长推进（含追帧上限与掉帧统计）
- `RuntimeMetrics`：输出 `avg/p95/max` 步时、总步数、累计掉帧秒数
- `RenderBridge`：适配器隔离容错，单个渲染器异常不会拖垮总循环（默认）

## 任务队列生命周期

每个 tick 固定执行如下队列任务（优先级从高到低）：

1. `entities:update`
2. `spatial:reindex`
3. `entities:reproduce`
4. `entities:cleanup`
5. `environment:spawn-energy`
6. `system:optimize`
7. `timeline:snapshot`

## 运行时能力

- `SimulationRuntime.step(delta)`：单步推进
- `SimulationRuntime.run(options)`：批量推进
- `SimulationRuntime.ingestRealTime(elapsedSeconds)`：实时输入→固定步长推进
- `SimulationRuntime.getMetrics()`：读取运行指标
- `SimulationRuntime.checkpoint(tail)`：获取报告 + 统计 + timeline + metrics
- `SimulationRuntime.exportCheckpointJSON(tail)`：导出 checkpoint JSON
- `SimulationRuntime.getRenderBridge()`：获取渲染桥接器

## Three.js 接入（可直接上线接入）

你现在可以将 `RenderFrame` 直接映射到 Three.js 的 InstancedMesh：

- `ThreeAdapter` 负责按实体类型分发
- `ThreeInstancedTarget` 负责写入矩阵/颜色并触发 `needsUpdate`

## 示例

```ts
import { SimulationRuntime, ThreeAdapter, ThreeInstancedTarget } from './dist/index.js';

const runtime = new SimulationRuntime(undefined, {
  fixedDelta: 1 / 60,
  maxHistorySize: 5000,
  strictAdapterIsolation: true,
});
runtime.bootstrap({ plants: 10, predators: 4, neutrals: 8, seed: 42 });

runtime.getRenderBridge().register(
  new ThreeAdapter({
    targets: {
      predator: predatorTarget,
      neutral: neutralTarget,
      plant: plantTarget,
    },
  }),
);

runtime.run({ maxSteps: 3600 });
console.log(runtime.getMetrics());
```

## 下一阶段（比赛级）

1. WebWorker + OffscreenCanvas 分离仿真与渲染线程。
2. InstancedMesh GPU culling + LOD。
3. Replay 文件格式（二进制压缩帧）。
4. 观测面板（P95 帧时、实体吞吐、事件速率）。
