# Monument Valley 风格长期生态模拟框架（比赛/商用增强版）

这是一个面向 **长期 AI 生态演化 + WebGL 可视化** 的核心框架。当前定位：

- **核心引擎能力已较完整（可长期运行）**
- **渲染与线程分离已具备工程化接口（可接入）**
- **仍有若干“产品化收尾”工作未完成（见下方待改进）**

---

## 已实现能力（Implemented）

### 1) 仿真内核与 AI

- 任务队列生命周期调度（更新、繁殖、清理、生成、优化、气候事件、快照）
- 行为树系统（Selector/Sequence/Condition/Action）
- Q-Learning 捕食者策略
- 环境系统（日夜 + 四季）
- 气候事件（`drought` / `storm` / `bloom`）
- 基础演化属性（traits + 变异繁殖）

### 2) 渲染接入与性能基础

- RenderBridge + RenderFrame 数据输出
- Three.js 接入适配层：
  - `ThreeAdapter`
  - `ThreeInstancedTarget`
  - `RenderPolicies`（颜色/矩阵/uniform 映射）
- 距离裁剪 `DistanceCuller`（可见集过滤 + cull ratio）

### 3) 运行时工程化

- 固定步长推进（FixedStepRunner）
- 运行配置强校验（config）
- 运行指标统计（RuntimeMetrics：avg/p95/max/dropped）
- 渲染适配器容错隔离（RenderBridge stats + isolation）
- 实时输入推进（`ingestRealTime`）

### 4) 回放、分析、调优

- Timeline 回放（TimelinePlayer）
- 帧录制（FrameRecorder）
- 二进制 replay：
  - `BinaryReplayCodec`（单块）
  - `BinaryReplayStream`（分块）
  - `ReplayCatalog`（元数据管理）
- Profiling：
  - `ProfilingDashboard`（评分/瓶颈/建议）
  - `ProfilingMonitor`（趋势/图表序列）
- 自动调参 `AutoTuner`（多 seed，支持并发）
- 知识性提示 `InsightEngine`

### 5) Worker 线程分离基础

- `WorkerProtocol`
- `SimulationWorkerHost`
- `SimulationWorkerRuntime`
- `createSimulationWorker(scope)` 快速绑定入口

---

## 仍需改进 / 尚未完全实现（Gaps）

### A. 真正浏览器端 Worker + OffscreenCanvas 收尾

目前是 **协议和运行时层已经完成**，但还缺“前端壳层落地”：

1. 真实 worker 入口脚本（`self.onmessage` + transferable canvas）
2. OffscreenCanvas 与 Three.js 渲染器真实绑定
3. 主线程 UI 与 worker 数据同步节流策略

### B. Replay 产品化增强

1. 分段校验（CRC）
2. 增量写入与断点恢复
3. 版本迁移策略（跨版本 replay 兼容）

### C. Profiling 可视化产品化

1. 真正仪表盘 UI（曲线、热区、钻取）
2. 报警阈值体系（告警规则）
3. 线上采样与归档策略

### D. AutoTuner 工程化升级

1. worker 池并行执行器（当前并发为进程内 Promise 并发）
2. 多目标优化（稳定性/性能/趣味性权重可配置）
3. 实验追踪（候选参数、seed、结果快照可回放）

### E. 游戏表现层仍可增强

1. 完整视觉特效（后处理、天气粒子、光照渐变）
2. 交互系统（编辑器、手动干预工具）
3. 教学模式（InsightEngine 驱动的任务/引导）

---

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

---

## 下一阶段建议（优先级）

1. **P0**：完成真实 Worker + OffscreenCanvas + Three.js 壳层联调
2. **P1**：上线 Profiling UI 与报警阈值
3. **P1**：Replay 校验与增量持久化
4. **P2**：AutoTuner worker 池 + 实验追踪
5. **P2**：玩法与知识性增强（任务系统 + 可解释提示）
