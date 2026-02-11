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
- ✅ 渲染桥接层（RenderBridge + RenderFrame + RendererAdapter）
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
- `SimulationRuntime.getRenderBridge()`：获取渲染桥接器

## Three.js/WebGL 接入时机（现在就可以）

你现在就可以接入渲染层，不需要再等核心能力。

**建议接入条件（当前已满足）：**

- 稳定 tick 管线与可预测调度（✅）
- 可复现运行（seed）（✅）
- 可订阅事件（✅）
- 可直接消费渲染帧结构（✅）

**建议下一步顺序：**

1. 实现 `RendererAdapter`（Three.js 版本），将 `RenderFrame.entities` 映射到 InstancedMesh。
2. 用 `type` 映射几何体（金字塔/立方体/球体）与 Morandi 颜色。
3. 每帧调用 `runtime.step(delta)`，在 `onFrame` 更新 transform/color。
4. 用 `EventBus` 追加 UI 面板（出生、死亡、季节变化）。


### Three.js 适配器（已开始）

已提供可落地的接入类：

- `ThreeAdapter`：将 `RenderFrame` 按实体类型分发到 predator/neutral/plant 三组目标
- `ThreeInstancedTarget`：把实体写入 `InstancedMesh-like` 对象（`setMatrixAt/setColorAt`）

这意味着你现在只需要在前端项目中提供真正的 Three.js `InstancedMesh`，即可完成桥接。

## 示例

```ts
import { SimulationRuntime } from './dist/index.js';

const runtime = new SimulationRuntime();
runtime.bootstrap({ plants: 10, predators: 4, neutrals: 8, seed: 42 });

runtime.getRenderBridge().register({
  onFrame(frame) {
    // 将 frame.entities 同步到 Three.js
    console.log(frame.tick, frame.counts.total);
  },
});

runtime.run({ delta: 1 / 30, maxSteps: 3600 });
```

## 后续建议（下一阶段）

1. 渲染层加 InstancedMesh + GPU frustum culling。
2. shader 接 season/dayPhase uniform 做颜色和光照细微变化。
3. 增加灾害/气候事件 task（干旱、风暴）并映射季节参数。
4. 增加 agent 行为策略回放（按 tick 记录动作分布）。
