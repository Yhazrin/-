import type { ProfilingSnapshot } from '../ProfilingDashboard.js';

export type AlertLevel = 'info' | 'warning' | 'critical';

export interface ProfilingAlert {
  level: AlertLevel;
  code: string;
  message: string;
}

export class AlertEngine {
  evaluate(snapshot: ProfilingSnapshot): ProfilingAlert[] {
    const alerts: ProfilingAlert[] = [];

    if (snapshot.status === 'critical') {
      alerts.push({ level: 'critical', code: 'profile_critical', message: 'Profiling score is critical; immediate optimization required.' });
    }

    for (const bottleneck of snapshot.bottlenecks) {
      alerts.push({
        level: snapshot.status === 'critical' ? 'critical' : 'warning',
        code: bottleneck,
        message: `Detected bottleneck: ${bottleneck}`,
      });
    }

    if (alerts.length === 0) {
      alerts.push({ level: 'info', code: 'profile_ok', message: 'Runtime profile is stable.' });
    }

    return alerts;
  }
}
