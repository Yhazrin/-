import type { Quest } from '../gameplay/QuestSystem.js';

export interface GuideTip {
  title: string;
  detail: string;
}

export interface QuestPanelModel {
  completed: number;
  total: number;
  quests: Quest[];
  nextTip: GuideTip;
}

export interface QuestPanelRenderer {
  render(model: QuestPanelModel): void;
}

export class QuestGuideController {
  constructor(private readonly renderer: QuestPanelRenderer) {}

  update(quests: Quest[]): QuestPanelModel {
    const completed = quests.filter((q) => q.completed).length;
    const pending = quests.find((q) => !q.completed);

    const model: QuestPanelModel = {
      completed,
      total: quests.length,
      quests,
      nextTip: pending
        ? { title: pending.title, detail: pending.knowledgeHint }
        : { title: '全部完成', detail: '当前生态运行稳定，可进入更高难度挑战。' },
    };

    this.renderer.render(model);
    return model;
  }
}
