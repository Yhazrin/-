export interface ExperimentRecord {
  id: string;
  createdAt: number;
  candidateName: string;
  seed: number;
  score: number;
  details?: Record<string, unknown>;
}

export class ExperimentTracker {
  private readonly records: ExperimentRecord[] = [];

  add(record: ExperimentRecord): void {
    this.records.push(record);
  }

  list(limit = 100): ExperimentRecord[] {
    return [...this.records].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }

  top(limit = 10): ExperimentRecord[] {
    return [...this.records].sort((a, b) => b.score - a.score).slice(0, limit);
  }

  byCandidate(candidateName: string): ExperimentRecord[] {
    return this.records.filter((r) => r.candidateName === candidateName);
  }
}
