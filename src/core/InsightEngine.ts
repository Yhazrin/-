import type { TickReport, TimelinePoint } from './types.js';

export interface Insight {
  title: string;
  detail: string;
  level: 'info' | 'hint' | 'warning';
}

export class InsightEngine {
  analyze(latest: TickReport, timeline: TimelinePoint[]): Insight[] {
    const insights: Insight[] = [];

    if (latest.climateEvent !== 'none') {
      insights.push({
        title: '气候事件触发',
        detail: `本 tick 触发 ${latest.climateEvent}，建议观察食物链波动。`,
        level: 'hint',
      });
    }

    const recent = timeline.slice(-20);
    if (recent.length >= 5) {
      const trend = recent[recent.length - 1]!.total - recent[0]!.total;
      if (trend > 10) insights.push({ title: '种群增长', detail: '近期总种群快速增长，可能接近资源瓶颈。', level: 'info' });
      if (trend < -10) insights.push({ title: '种群衰退', detail: '近期总种群显著下滑，建议调整补给与捕食压力。', level: 'warning' });
    }

    if (latest.avgEnergy < 30) {
      insights.push({ title: '能量预警', detail: '平均能量偏低，生态可能进入高死亡期。', level: 'warning' });
    }

    if (insights.length === 0) {
      insights.push({ title: '生态稳定', detail: '系统处于平稳区间，可继续观察行为演化。', level: 'info' });
    }

    return insights;
  }
}
