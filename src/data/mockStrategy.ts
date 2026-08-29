import type { StrategyComparison, EnergyStrategy, StrategyPoint } from '../types/strategy';
import type { TelemetryData } from '../types/telemetry';

export const generateMockStrategy = (telemetryData: TelemetryData): StrategyComparison => {
  const points: StrategyPoint[] = [];
  const optimizedPoints: StrategyPoint[] = [];
  
  let naiveBattery = 4.0;
  let optimizedBattery = 4.0;
  
  let naiveBlackout = false;
  let naiveBlackoutDistance = 0;
  let optBlackout = false;
  
  telemetryData.telemetry.forEach(t => {
    // Naive logic: deploy on throttle, no smart recovery
    let nDep = t.throttle > 80 ? 0.05 : 0;
    let nRec = t.brake ? 0.01 : 0;
    
    naiveBattery = Math.min(4.0, Math.max(0, naiveBattery - nDep + nRec));
    if (naiveBattery === 0 && !naiveBlackout) {
      naiveBlackout = true;
      naiveBlackoutDistance = t.distance;
    }
    
    points.push({
      distance: t.distance,
      battery: naiveBattery,
      deployment: nDep,
      recovery: nRec,
      blackout: naiveBattery === 0
    });
    
    // Optimized logic: save battery for long straights, recover aggressively
    let oDep = t.throttle > 95 ? 0.03 : 0; // Less aggressive deployment
    let oRec = t.brake ? 0.025 : 0.005; // Better recovery mapping
    
    optimizedBattery = Math.min(4.0, Math.max(0, optimizedBattery - oDep + oRec));
    if (optimizedBattery === 0 && !optBlackout) {
      optBlackout = true;
    }
    
    optimizedPoints.push({
      distance: t.distance,
      battery: optimizedBattery,
      deployment: oDep,
      recovery: oRec,
      blackout: optimizedBattery === 0
    });
  });

  const naive: EnergyStrategy = {
    id: "naive",
    name: "Naive Deployment",
    summary: {
      minimumBattery: Math.min(...points.map(p => p.battery)),
      blackout: naiveBlackout,
      blackoutDistance: naiveBlackoutDistance,
      efficiency: 45,
      performanceScore: 68
    },
    points: points,
    segmentRecommendations: []
  };
  
  const optimized: EnergyStrategy = {
    id: "optimized",
    name: "AI Optimized",
    summary: {
      minimumBattery: Math.min(...optimizedPoints.map(p => p.battery)),
      blackout: optBlackout,
      efficiency: 92,
      performanceScore: 94
    },
    points: optimizedPoints,
    segmentRecommendations: []
  };

  return {
    strategies: [naive, optimized],
    engineerReport: {
      summary: "SIMULATED DATA: Naive deployment rapidly depletes the energy store leading to a blackout before the end of the lap. The AI Optimized strategy balances deployment across key acceleration zones while maximizing harvesting in braking zones, completely avoiding blackout risk."
    }
  };
};
