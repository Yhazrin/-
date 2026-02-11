# Monument Valley 风格长期生态模拟框架（比赛/商用增强版）

这是一个面向 **长期 AI 生态演化 + WebGL 可视化** 的核心框架，当前已覆盖：

- 稳定仿真内核（任务队列、行为树、Q-learning、季节环境、气候事件）
- 渲染桥接（RenderBridge / ThreeAdapter / InstancedTarget / 渲染策略）
- 运行时工程化（固定步长、参数强校验、指标统计、容错隔离）
- 回放分析（timeline 回放、帧录制、二进制 replay）
- 自动调参（多 seed 批跑排名）
- 端到端 profiling 仪表模型
- Worker + OffscreenCanvas 协议层（线程分离协议）

## 快速开始

```bash
npm run build
npm test
npm run test:coverage
```

## 你要求补齐的四项（已实现）

### 1) Worker + OffscreenCanvas（仿真渲染线程分离）

- `src/core/worker/WorkerProtocol.ts`：定义线程通信协议与 `OffscreenCanvasLike`
- `src/core/worker/SimulationWorkerHost.ts`：主线程控制器（init/bootstrap/step/run/checkpoint/stop）

### 2) 二进制 replay（不是 JSON）

- `src/core/replay/BinaryReplay.ts`：`BinaryReplayCodec.encode/decode`
- `FrameRecorder` 已支持 `exportBinary/importBinary`

### 3) 端到端 profiling 仪表

- `src/core/ProfilingDashboard.ts`：聚合 runtime/culling/event/replay 指标，输出 score、状态、瓶颈与建议

### 4) 自动调参批跑框架（多 seed 排名）

- `src/core/AutoTuner.ts`：给定候选配置 + seeds + steps，输出排序结果（score/stability/perfPenalty）

## 增强“知识性/趣味性/高级智能”

- `src/core/InsightEngine.ts`：基于 tick 与 timeline 自动生成生态解读/预警文案
- `src/core/ClimateEvents.ts`：drought / storm / bloom 干预生态，提升动态变化与可玩性

## 比赛级渲染链路

- `RenderPolicies`：`colorPolicy` / `matrixPolicy` / `mapEnvironmentToUniforms`
- `DistanceCuller`：可见集过滤 + cull ratio 统计
- `ThreeAdapter`：实体按类型分发到 InstancedTarget
- `ThreeInstancedTarget`：写入矩阵/颜色并触发 GPU 更新

## 下一阶段建议

1. 真正 Worker 运行器（worker 脚本 + 消息循环 + transfer 控制）
2. OffscreenCanvas 实际渲染实现（非 Like 接口）
3. 分块二进制 replay（边录边刷盘）
4. 面向 UI 的实时 profiling 面板（曲线图 + bottleneck drill-down）
5. 自动调参并行执行（worker 池）
