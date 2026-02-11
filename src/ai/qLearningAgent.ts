export interface AgentState {
  x: number;
  z: number;
  health: number;
  energy: number;
  nearestPreyDistanceBucket: number;
}

export class QLearningAgent {
  private readonly qTable = new Map<string, Map<string, number>>();

  constructor(
    private readonly learningRate = 0.12,
    private readonly discountFactor = 0.92,
    private explorationRate = 1,
    private readonly minExplorationRate = 0.03,
    private readonly explorationDecay = 0.998,
  ) {}

  private toKey(s: AgentState): string {
    return [Math.round(s.x), Math.round(s.z), Math.round(s.health / 10), Math.round(s.energy / 10), s.nearestPreyDistanceBucket].join(':');
  }

  private getQ(stateKey: string, action: string): number {
    if (!this.qTable.has(stateKey)) this.qTable.set(stateKey, new Map());
    const actions = this.qTable.get(stateKey)!;
    if (!actions.has(action)) actions.set(action, 0);
    return actions.get(action)!;
  }

  chooseAction(state: AgentState, availableActions: string[], random: () => number): string {
    if (random() < this.explorationRate) {
      return availableActions[Math.floor(random() * availableActions.length)]!;
    }
    const key = this.toKey(state);
    return availableActions.reduce((best, action) => (this.getQ(key, action) > this.getQ(key, best) ? action : best), availableActions[0]!);
  }

  update(state: AgentState, action: string, reward: number, nextState: AgentState, nextActions: string[]): void {
    const key = this.toKey(state);
    const nextKey = this.toKey(nextState);
    const current = this.getQ(key, action);
    const nextMax = Math.max(...nextActions.map((a) => this.getQ(nextKey, a)));
    const newQ = current + this.learningRate * (reward + this.discountFactor * nextMax - current);
    this.qTable.get(key)!.set(action, newQ);
  }

  decayExploration(): void {
    this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);
  }

  stats(): { states: number; qValues: number; explorationRate: number } {
    let qValues = 0;
    for (const actionMap of this.qTable.values()) qValues += actionMap.size;
    return { states: this.qTable.size, qValues, explorationRate: this.explorationRate };
  }
}
