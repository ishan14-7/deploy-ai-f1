import type { TelemetryData } from '../types/telemetry';
import type { StrategyComparison, EnergyStrategy } from '../types/strategy';

/**
 * Interface for providing energy strategies.
 * Future ML/API implementations will implement this interface.
 */
export interface IStrategyProvider {
  getStrategy(telemetry: TelemetryData): Promise<StrategyComparison>;
}

export class MockStrategyProvider implements IStrategyProvider {
  async getStrategy(telemetry: TelemetryData): Promise<StrategyComparison> {
    // Simulate battery drain based on throttle
    let naiveBattery = 4.0;
    let optBattery = 4.0;
    
    const naivePoints = telemetry.telemetry.map(pt => {
      // Drain very fast on throttle
      if (pt.throttle > 50 && naiveBattery > 0) naiveBattery -= 0.02;
      // Recover a tiny bit on brake
      if (pt.brake && naiveBattery < 4.0) naiveBattery += 0.005;
      naiveBattery = Math.max(0, Math.min(4.0, naiveBattery));
      return { distance: pt.distance, battery: naiveBattery, deployment: 0, recovery: 0, blackout: naiveBattery === 0 };
    });
    
    const optPoints = telemetry.telemetry.map(pt => {
      // Drain efficiently
      if (pt.throttle > 50 && optBattery > 0) optBattery -= 0.012;
      // Recover well on brake
      if (pt.brake && optBattery < 4.0) optBattery += 0.015;
      optBattery = Math.max(0, Math.min(4.0, optBattery));
      return { distance: pt.distance, battery: optBattery, deployment: 0, recovery: 0, blackout: false };
    });

    const mockStrategies: EnergyStrategy[] = [
      {
        id: "ai_opt",
        name: "AI OPTIMIZED",
        points: optPoints,
        summary: { blackout: false, minimumBattery: optBattery, efficiency: 95, performanceScore: 98 },
        segmentRecommendations: []
      },
      {
        id: "naive",
        name: "NAIVE STRATEGY",
        points: naivePoints,
        summary: { blackout: naiveBattery === 0, minimumBattery: naiveBattery, efficiency: 60, performanceScore: 40 },
        segmentRecommendations: []
      }
    ];

    return {
      strategies: mockStrategies,
      engineerReport: {
        summary: "The Naive Strategy aggressively deploys energy on the main straight but triggers a total blackout before the Parabolica, resulting in severe time loss. The AI Optimized approach slightly lifts and coasts into Ascari to preserve just enough energy (0.4 MJ) to cross the finish line safely without clipping."
      }
    };
  }
}

// Default export for the current implementation
export const strategyProvider: IStrategyProvider = new MockStrategyProvider();
