import { Ad, Area, Schedule, ScheduledAd, PlacementEngine } from './placementEngine';
import { RevenueEngine } from './revenueEngine';

export class Scheduler {
  placementEngine: PlacementEngine;
  revenueEngine: RevenueEngine;

  constructor(placementEngine: PlacementEngine, revenueEngine: RevenueEngine) {
    this.placementEngine = placementEngine;
    this.revenueEngine = revenueEngine;
  }

  getNextAvailableStartTime(areaSchedule: ScheduledAd[]): number {
    if (!areaSchedule || areaSchedule.length === 0) return 0;
    const sorted = [...areaSchedule].sort((a, b) => a.startTime - b.startTime);
    let earliest = 0;
    for (const s of sorted) {
      if (earliest < s.startTime) return earliest;
      earliest = Math.max(earliest, s.endTime);
    }
    return earliest;
  }

  isValidSchedule(schedule: Schedule, areas: Area[], ads: Ad[]): boolean {
    const adMap = new Map(ads.map(a => [a.adId, a]));
    const areaMap = new Map(areas.map(a => [a.areaId, a]));
    const seenAds = new Set<string>();

    for (const [areaId, scheduledAds] of Object.entries(schedule)) {
      const area = areaMap.get(areaId);
      if (!area) return false; // Unknown area key

      // Sort area schedule to check overlaps
      const sorted = [...scheduledAds].sort((a, b) => a.startTime - b.startTime);
      let lastEnd = 0;

      for (const s of sorted) {
        const ad = adMap.get(s.adId);
        if (!ad) return false; // unknown ad
        if (seenAds.has(s.adId)) return false; // ad scheduled multiple times
        if (s.areaId !== areaId) return false; // areaId mismatch
        if (ad.bannedLocations.includes(area.location)) return false; // banned location

        const expectedEnd = s.startTime + ad.duration;
        if (s.endTime !== expectedEnd) return false; // duration mismatch
        if (s.startTime < ad.timeReceived || s.startTime > ad.timeReceived + ad.timeout)
          return false; // outside time window
        if (s.startTime < lastEnd) return false; // overlap in area
        if (s.endTime > area.timeWindow) return false; // exceeds area window

        seenAds.add(s.adId);
        lastEnd = s.endTime;
      }
    }

    return true;
  }

  compareSchedules(
    ads: Ad[],
    areas: Area[],
    scheduleA: Schedule,
    scheduleB: Schedule,
    decayRate: number
  ): number {
    const revenueA = this.calculateTotalRevenue(ads, areas, scheduleA, decayRate);
    const revenueB = this.calculateTotalRevenue(ads, areas, scheduleB, decayRate);

    if (revenueA !== revenueB) return revenueA - revenueB;

    const unusedA = this.totalUnusedTime(areas, scheduleA);
    const unusedB = this.totalUnusedTime(areas, scheduleB);
    if (unusedA !== unusedB) return unusedB - unusedA; // less unused time better

    const diversityA = this.revenueEngine.getAdvertiserDiversity(ads, scheduleA);
    const diversityB = this.revenueEngine.getAdvertiserDiversity(ads, scheduleB);
    if (diversityA !== diversityB) return diversityA - diversityB;

    return 0; // equivalent
  }

  buildSchedule(ads: Ad[], areas: Area[], decayRate: number): Schedule {
    if (!ads || ads.length === 0) return {};

    const schedule: Schedule = {};
    for (const area of areas) {
      schedule[area.areaId] = [];
    }

    let canStillPlaceAds = true;

    while (canStillPlaceAds) {
      let bestPlacement: {
        ad: Ad;
        area: Area;
        startTime: number;
        totalRevenue: number;
        diversity: number;
      } | null = null;

      // Evaluate every potential placement across all areas
      for (const area of areas) {
        const startTime = this.getNextAvailableStartTime(schedule[area.areaId]);

        for (const ad of ads) {
          if (this.placementEngine.canScheduleAd(ad, area, schedule, startTime)) {

            // Temporarily commit the ad to evaluate the resulting schedule
            schedule[area.areaId].push({
              adId: ad.adId,
              areaId: area.areaId,
              startTime,
              endTime: startTime + ad.duration
            });

            const currentTotalRevenue = this.calculateTotalRevenue(ads, areas, schedule, decayRate);
            const currentDiversity = this.revenueEngine.getAdvertiserDiversity(ads, schedule);

            // Compare current candidate against the best found so far
            if (this.isSuperiorPlacement(ad, currentTotalRevenue, currentDiversity, bestPlacement)) {
              bestPlacement = {
                ad,
                area,
                startTime,
                totalRevenue: currentTotalRevenue,
                diversity: currentDiversity
              };
            }

            schedule[area.areaId].pop(); // Rollback temporary placement
          }
        }
      }

      // Finalize best placement found in this pass
      if (bestPlacement) {
        schedule[bestPlacement.area.areaId].push({
          adId: bestPlacement.ad.adId,
          areaId: bestPlacement.area.areaId,
          startTime: bestPlacement.startTime,
          endTime: bestPlacement.startTime + bestPlacement.ad.duration
        });
      } else {
        canStillPlaceAds = false; // No valid moves left
      }
    }

    return schedule;
  }

  private totalUnusedTime(areas: Area[], schedule: Schedule): number {
    let total = 0;
    for (const area of areas) {
      const areaSchedule = schedule[area.areaId] || [];
      const used = areaSchedule.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
      total += area.timeWindow - used;
    }
    return total;
  }

  private calculateTotalRevenue(ads: Ad[], areas: Area[], schedule: Schedule, decayRate: number): number {
    return areas.reduce((sum, area) =>
      sum + this.revenueEngine.getAreaRevenue(area, areas, schedule, ads, decayRate), 0
    );
  }

  // Tie breakers
  private isSuperiorPlacement(
    ad: Ad,
    revenue: number,
    diversity: number,
    best: { ad: Ad; totalRevenue: number; diversity: number } | null
  ): boolean {
    if (!best) return true;

    if (revenue !== best.totalRevenue) return revenue > best.totalRevenue;

    if (ad.duration !== best.ad.duration) return ad.duration > best.ad.duration;

    if (diversity !== best.diversity) return diversity > best.diversity;

    return ad.adId < best.ad.adId;
  }


}