import type { TickReport, TimelinePoint } from '../core/types.js';

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  knowledgeHint: string;
}

export class QuestSystem {
  evaluate(latest: TickReport, timeline: TimelinePoint[]): Quest[] {
    const total = latest.total;
    const trend = timeline.length > 1 ? timeline[timeline.length - 1]!.total - timeline[Math.max(0, timeline.length - 20)]!.total : 0;

    const quests: Quest[] = [
      {
        id: 'survival_100',
        title: '百体生存',
        description: '让生态总数稳定超过 100。',
        completed: total >= 100,
        knowledgeHint: '关注能量循环和捕食压力平衡。',
      },
      {
        id: 'climate_adapt',
        title: '气候适应',
        description: '在气候事件后保持种群不崩溃。',
        completed: latest.climateEvent !== 'none' ? total > 20 : false,
        knowledgeHint: '观察 drought/storm/bloom 对不同物种的影响。',
      },
      {
        id: 'growth_control',
        title: '增长控制',
        description: '在增长中保持稳定，不出现过大波动。',
        completed: trend > 0 && trend < 40,
        knowledgeHint: '适当调低捕食压力并增加植物再生。',
      },
    ];

    return quests;
  }
}
