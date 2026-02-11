# Monument Valley 风格长期生态模拟框架（比赛/商用增强版）

这是一个面向 **长期 AI 生态演化 + WebGL 可视化** 的核心框架，当前重点是“可上线工程能力 + 可竞赛调优能力”。

## 已落地能力

- 稳定仿真内核（任务队列、行为树、Q-learning、季节环境、气候事件）
- 渲染桥接（RenderBridge / ThreeAdapter / InstancedTarget / 渲染策略）
- 运行时工程化（固定步长、参数强校验、指标统计、容错隔离）
- 回放分析（timeline 回放、帧录制、二进制 replay、分块 replay）
- 自动调参（多 seed 批跑排名，支持并发）
- 端到端 profiling（评分器 + 时间序列 monitor）
- Worker + OffscreenCanvas 协议、host 与 runtime
- 生态知识解读（InsightEngine）

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

## 关键模块

### Worker + OffscreenCanvas（线程分离）

- `WorkerProtocol`：线程协议
- `SimulationWorkerHost`：主线程控制器
- `SimulationWorkerRuntime`：worker 内运行时消息处理器
- `createSimulationWorker(scope)`：真实 worker 全局绑定入口

### 二进制 Replay

- `BinaryReplayCodec`：单块二进制编码/解码
- `BinaryReplayStream`：分块编码/解码
- `FrameRecorder`：`exportBinary()` / `importBinary()`
- `ReplayCatalog`：回放元数据管理（标签/排序/删除）

### 端到端 Profiling

- `ProfilingDashboard`：score/status/bottlenecks/recommendations
- `ProfilingMonitor`：时间序列采样、趋势聚合、图表序列输出

### 自动调参批跑

- `AutoTuner.rank(...)`：多 seed + 并发批跑 + 排名

### 趣味性与知识性增强

- `ClimateEventEngine`：drought/storm/bloom 动态干预
- `InsightEngine`：自动输出生态提示/预警

## 接下来（更高级）

1. 真正浏览器 Worker 脚本（`self.onmessage` + transferable 对象）
2. OffscreenCanvas 真渲染实现与 Three.js 主场景联动
3. replay 增量压缩与分段校验（CRC）
4. profiling 可视化面板（多图层 drill-down）
5. AutoTuner worker 池并行化执行器
