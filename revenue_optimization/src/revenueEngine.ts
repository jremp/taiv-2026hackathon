import { Ad, Area, Schedule, ScheduledAd, PlacementEngine } from './placementEngine';

export class RevenueEngine {
    placementEngine: PlacementEngine;

    constructor(placementEngine: PlacementEngine) {
        this.placementEngine = placementEngine;
    }

    // Helper: get global placements sorted per advertiser
    private getGlobalAdvertiserPlacements(
        ads: Ad[],
        areas: Area[],
        schedule: Schedule
    ): Map<string, { ad: Ad; areaId: string; startTime: number; rawRevenue: number }[]> {
        const adMap = new Map(ads.map(a => [a.adId, a]));
        const areaMap = new Map(areas.map(a => [a.areaId, a]));

        const placements: {
            ad: Ad;
            areaId: string;
            startTime: number;
            rawRevenue: number;
        }[] = [];

        for (const [areaId, scheduledAds] of Object.entries(schedule)) {
            const areaObj = areaMap.get(areaId);
            if (!areaObj) continue;

            for (const s of scheduledAds) {
                const ad = adMap.get(s.adId);
                if (!ad) continue;

                placements.push({
                    ad,
                    areaId,
                    startTime: s.startTime,
                    rawRevenue: ad.baseRevenue * areaObj.multiplier,
                });
            }
        }

        const byAdvertiser = new Map<string, typeof placements>();

        for (const p of placements) {
            if (!byAdvertiser.has(p.ad.advertiserId)) {
                byAdvertiser.set(p.ad.advertiserId, []);
            }
            byAdvertiser.get(p.ad.advertiserId)!.push(p);
        }

        // Sort each advertiser's placements by the global rules
        for (const advertiserPlacements of byAdvertiser.values()) {
            advertiserPlacements.sort((a, b) => {
                if (a.startTime !== b.startTime) return a.startTime - b.startTime;
                if (a.rawRevenue !== b.rawRevenue) return a.rawRevenue - b.rawRevenue;
                return a.ad.adId.localeCompare(b.ad.adId);
            });
        }

        return byAdvertiser;
    }

    getAdvertiserScheduleCount(advertiserId: string, ads: Ad[], schedule: Schedule): number {
        const adMap = new Map(ads.map(a => [a.adId, a]));
        let count = 0;
        for (const areaAds of Object.values(schedule)) {
            for (const s of areaAds) {
                const ad = adMap.get(s.adId);
                if (ad &&
                    ad.advertiserId === advertiserId) {
                    count++;
                }
            }
        }
        return count;
    }

    calculateDiminishedRevenue(baseRevenue: number, advertiserScheduledCount: number, decayRate: number): number {
        return baseRevenue * decayRate ** advertiserScheduledCount;
    }

    calculatePlacementRevenue(ad: Ad, areas: Area[], ads: Ad[], schedule: Schedule, decayRate: number): number {
        const byAdvertiser = this.getGlobalAdvertiserPlacements(ads, areas, schedule);
        const placements = byAdvertiser.get(ad.advertiserId) || [];

        const index = placements.findIndex(p => p.ad.adId === ad.adId);
        if (index === -1) return 0;

        const rawRevenue = placements[index].rawRevenue;
        return this.calculateDiminishedRevenue(rawRevenue, index, decayRate);
    }

    getAdvertiserDiversity(ads: Ad[], schedule: Schedule): number {
        const adMap = new Map(ads.map(a => [a.adId, a]));
        const advertisers = new Set<string>();
        for (const areaAds of Object.values(schedule)) {
            for (const s of areaAds) {
                const ad = adMap.get(s.adId);
                if (ad) advertisers.add(ad.advertiserId);
            }
        }
        return advertisers.size;
    }

    getAreaRevenue(area: Area, areasArray: Area[], fullSchedule: Schedule, ads: Ad[], decayRate: number): number {
        if (!(area.areaId in fullSchedule)) return 0;

        const byAdvertiser = this.getGlobalAdvertiserPlacements(ads, areasArray, fullSchedule);
        let total = 0;

        for (const advertiserPlacements of byAdvertiser.values()) {
            advertiserPlacements.forEach((p, index) => {
                if (p.areaId === area.areaId) {
                    total += this.calculateDiminishedRevenue(p.rawRevenue, index, decayRate);
                }
            });
        }

        return total;
    }
}