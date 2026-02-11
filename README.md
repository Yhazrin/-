# Monument Valley 风格长期生态模拟框架（商用推进版）

这个仓库提供一个**长期运行、可调优、任务队列驱动**的生态模拟内核，并已进入比赛级/商用级实施阶段。

## 当前能力

- ✅ 生命周期任务队列（按优先级调度）
- ✅ 行为树 + Q-Learning
- ✅ 环境循环（昼夜 + 四季）
- ✅ 遗传特征与变异
- ✅ 自动调优器（种群压力驱动）
- ✅ SpatialGrid 近邻查询优化
- ✅ EventBus 观测事件
- ✅ Timeline 与 checkpoint 导出
- ✅ RenderBridge + ThreeAdapter + ThreeInstancedTarget
- ✅ 固定步长追帧、运行配置校验、运行指标统计
- ✅ 时间线回放（TimelinePlayer）
- ✅ 渲染帧录制（FrameRecorder）
- ✅ 环境参数到 shader uniform 映射
- ✅ 气候事件任务（drought/storm/bloom）
- ✅ 距离裁剪与裁剪率统计（DistanceCuller）

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

## 商用运行能力（核心）

- `validateRuntimeConfig`：强校验
- `FixedStepRunner`：真实时间输入下的固定步长推进
- `RuntimeMetrics`：avg/p95/max 步时 + dropped seconds
- `RenderBridge`：适配器容错隔离 + 错误统计
- `SimulationRuntime.ingestRealTime`：用于浏览器 raf/worker 实时驱动

## 比赛级渲染链路

- `RenderPolicies`：
  - `colorPolicy(entity)`
  - `matrixPolicy(entity)`
  - `mapEnvironmentToUniforms(environment)`
- `DistanceCuller`：用于渲染前可见集过滤 + cull ratio 统计
- `ThreeAdapter`：按类型分组分发
- `ThreeInstancedTarget`：写入 InstancedMesh-like 目标并触发 needsUpdate

## 队列任务（当前）

1. `entities:update`
2. `spatial:reindex`
3. `entities:reproduce`
4. `entities:cleanup`
5. `environment:spawn-energy`
6. `system:optimize`
7. `climate:event`
8. `timeline:snapshot`

## 下一步（你要的商用级持续推进）

1. Worker 分离仿真与渲染线程（OffscreenCanvas）
2. 二进制 Replay 编码与回放
3. 端到端 profiling 仪表盘（step p95、事件吞吐、cull ratio）
4. 自动调参实验框架（多 seed 批跑 + 指标排名）
