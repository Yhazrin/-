export interface AgentState {
  x: number;
  z: number;
  health: number;
  energy: number;
}

export class QLearningAgent {
  private readonly qTable = new Map<string, Map<string, number>>();

  constructor(
    private readonly learningRate = 0.1,
    private readonly discountFactor = 0.9,
    private explorationRate = 1,
    private readonly minExplorationRate = 0.05,
    private readonly explorationDecay = 0.995,
  ) {}

  private key(state: AgentState): string {
    return `${Math.round(state.x)}:${Math.round(state.z)}:${Math.round(state.health / 10)}:${Math.round(state.energy / 10)}`;
  }

  private getQ(stateKey: string, action: string): number {
    if (!this.qTable.has(stateKey)) this.qTable.set(stateKey, new Map());
    const actionMap = this.qTable.get(stateKey)!;
    if (!actionMap.has(action)) actionMap.set(action, 0);
    return actionMap.get(action)!;
  }

  chooseAction(state: AgentState, actions: string[]): string {
    if (Math.random() < this.explorationRate) {
      return actions[Math.floor(Math.random() * actions.length)]!;
    }

    const stateKey = this.key(state);
    return actions.reduce((best, action) => (this.getQ(stateKey, action) > this.getQ(stateKey, best) ? action : best), actions[0]!);
  }

  update(state: AgentState, action: string, reward: number, nextState: AgentState, nextActions: string[]): void {
    const stateKey = this.key(state);
    const nextStateKey = this.key(nextState);

    const currentQ = this.getQ(stateKey, action);
    const nextMax = Math.max(...nextActions.map((a) => this.getQ(nextStateKey, a)));
    const target = reward + this.discountFactor * nextMax;
    const updated = currentQ + this.learningRate * (target - currentQ);
    this.qTable.get(stateKey)!.set(action, updated);
  }

  decayExploration(): void {
    this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);
  }

  getStats(): { states: number; actions: number; avgQ: number; explorationRate: number } {
    let states = 0;
    let actions = 0;
    let totalQ = 0;

    for (const actionMap of this.qTable.values()) {
      states += 1;
      for (const q of actionMap.values()) {
        actions += 1;
        totalQ += q;
      }
    }

    return { states, actions, avgQ: actions === 0 ? 0 : totalQ / actions, explorationRate: this.explorationRate };
  }
}
