import { AlertEngine, type ProfilingAlert } from '../core/profiling/AlertEngine.js';
import type { ProfilingSnapshot } from '../core/ProfilingDashboard.js';

export interface ProfilingPanelViewModel {
  title: string;
  scoreLabel: string;
  status: ProfilingSnapshot['status'];
  bottlenecks: string[];
  recommendations: string[];
  alerts: ProfilingAlert[];
}

export interface ProfilingPanelRenderer {
  render(model: ProfilingPanelViewModel): void;
}

export class ProfilingPanelController {
  private readonly alerts = new AlertEngine();

  constructor(private readonly renderer: ProfilingPanelRenderer) {}

  update(snapshot: ProfilingSnapshot): ProfilingPanelViewModel {
    const model: ProfilingPanelViewModel = {
      title: 'E2E Profiling Dashboard',
      scoreLabel: `Score ${snapshot.score}/100`,
      status: snapshot.status,
      bottlenecks: snapshot.bottlenecks,
      recommendations: snapshot.recommendations,
      alerts: this.alerts.evaluate(snapshot),
    };
    this.renderer.render(model);
    return model;
  }
}
