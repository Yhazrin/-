export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface EnvironmentState {
  elapsed: number;
  dayPhase: number;
  season: Season;
  lightIntensity: number;
  plantGrowthMultiplier: number;
  predatorDrainMultiplier: number;
}

export class EnvironmentController {
  private elapsed = 0;

  tick(delta: number): EnvironmentState {
    this.elapsed += delta;
    const dayPhase = (this.elapsed % 120) / 120;
    const seasonPhase = (this.elapsed % 480) / 480;

    let season: Season = 'spring';
    if (seasonPhase >= 0.25 && seasonPhase < 0.5) season = 'summer';
    else if (seasonPhase >= 0.5 && seasonPhase < 0.75) season = 'autumn';
    else if (seasonPhase >= 0.75) season = 'winter';

    const lightIntensity = 0.6 + Math.sin(dayPhase * Math.PI * 2) * 0.4;
    const seasonGrowth = season === 'spring' ? 1.2 : season === 'summer' ? 1.05 : season === 'autumn' ? 0.9 : 0.75;

    return {
      elapsed: this.elapsed,
      dayPhase,
      season,
      lightIntensity,
      plantGrowthMultiplier: seasonGrowth * (0.8 + lightIntensity * 0.2),
      predatorDrainMultiplier: season === 'winter' ? 1.2 : 1,
    };
  }
}
