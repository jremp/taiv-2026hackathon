export interface Ad {
    adId: string;
    advertiserId: string;
    timeReceived: number;
    timeout: number;
    duration: number;
    baseRevenue: number;
    bannedLocations: string[];
}

export interface Area {
    areaId: string;
    location: string;
    multiplier: number;
    totalScreens: number;
    timeWindow: number;
}

export interface ScheduledAd {
    adId: string;
    areaId: string;
    startTime: number;
    endTime: number;
}

export type Schedule = Record<string, ScheduledAd[]>;

export class PlacementEngine {

    constructor() {
    }

    isAdCompatibleWithArea(ad: Ad, area: Area): boolean {
        return !ad.bannedLocations.includes(area.location);
    }

    getTotalScheduledTimeForArea(areaSchedule: ScheduledAd[]): number {
        let total: number = 0;
        for (const ad of areaSchedule) {
            total += ad.endTime - ad.startTime;
        }
        return total;
    }

    doesPlacementFitTimingConstraints(
        ad: Ad,
        area: Area,
        startTime: number
    ): boolean {
        if (startTime < ad.timeReceived) {
            return false;
        } else if (startTime > area.timeWindow) {
            return false;
        } else if (startTime + ad.duration > area.timeWindow) {
            return false;
        } else if (startTime > ad.timeReceived + ad.timeout) {
            return false;
        } else {
            return true;
        }
    }

    isAdAlreadyScheduled(adId: string, schedule: Schedule): boolean {
        for (const scheduledAds of Object.values(schedule)) {
            for (const ad of scheduledAds) {
                if (ad.adId === adId) {
                    return true;
                }
            }
        }
        return false;
    }

    canScheduleAd(
        ad: Ad,
        area: Area,
        schedule: Schedule,
        startTime: number
    ): boolean {
        if (!this.isAdCompatibleWithArea(ad, area)) {
            return false;
        } else if (this.isAdAlreadyScheduled(ad.adId, schedule)) {
            return false;
        } else if (!this.doesPlacementFitTimingConstraints(ad, area, startTime)) {
            return false;
        }

        // TODO: Check if placement overlaps an existing ad in the same area
        for (const scheduledAds of Object.values(schedule)) {
            for (const otherAd of scheduledAds) {
                if (otherAd.areaId === area.areaId &&
                    this.hasOverlap(startTime, startTime + ad.duration, otherAd.startTime, otherAd.endTime)
                    // startTime <= otherAd.endTime - 1 && otherAd.startTime <= startTime + ad.duration - 1
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    isAreaScheduleValid(area: Area, areaSchedule: ScheduledAd[], ads: Ad[]): boolean {
        for (const ad of ads) {
            // Check if ads are allowed in area
            if (!this.isAdCompatibleWithArea(ad, area)) {
                return false;
            }
        }

        for (const scheduledAd of areaSchedule) {
            // Check if ads fit in time window
            if (scheduledAd.endTime > area.timeWindow) {
                return false;
            }
        }

        // Sort by start time
        const sortedSchedule = [...areaSchedule].sort((a, b) => a.startTime - b.startTime);

        // Check overlaps
        for (let i = 0; i < sortedSchedule.length - 1; i++) {
            const current = sortedSchedule[i];
            const next = sortedSchedule[i + 1];

            if (this.hasOverlap(current.startTime, current.endTime, next.startTime, next.endTime)) {
                return false;
            }
        }

        for (const ad of ads) {
            let found: boolean = false;
            for (const scheduledAd of areaSchedule) {
                if (scheduledAd.adId === ad.adId &&
                    scheduledAd.endTime - scheduledAd.startTime === ad.duration
                ) {
                    found = true;
                }
            }
            if (!found) {
                return false;
            }
        }

        return true;
    }

    private hasOverlap(startTime1: number, endTime1: number, startTime2: number, endTime2: number) {
        return startTime1 <= endTime2 - 1 && startTime2 <= endTime1 - 1
    }
}