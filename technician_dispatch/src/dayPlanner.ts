/**
 * CHALLENGE 2: Single Technician — Maximum Boxes in a Working Day
 *
 * A technician has a fixed number of working minutes today. Each box has a
 * GPS location and a repair time. Travelling between locations also burns
 * time. Your goal: choose WHICH boxes to visit and in WHAT ORDER to maximise
 * the number of boxes fixed before time runs out.
 *
 * The key insight — the closest box is NOT always the best choice:
 *   A nearby box with a long fix time can consume all remaining budget,
 *   whereas skipping it might let you fix two or three faster boxes instead.
 *   Your algorithm must weigh travel time against fix time to make the right call.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Box {
    id: string;
    name: string;
    location: Location;
    /** Minutes needed to fully repair this box once the technician arrives. */
    fixTimeMinutes: number;
}

export interface Technician {
    id: string;
    name: string;
    startLocation: Location;
    speedKmh: number;
    workingMinutes: number;
}

export interface DayPlanResult {
    technicianId: string;
    /** Ordered list of box IDs visited today. Every box must be fully completed. */
    plannedRoute: string[];
    /** Total minutes used (travel + all fix times). Must be ≤ workingMinutes. */
    totalTimeUsedMinutes: number;
    /** Equal to plannedRoute.length. */
    boxesFixed: number;
    /** Every box NOT in plannedRoute. */
    skippedBoxIds: string[];
}

export class DayPlanner {

    // ── Pre-implemented helpers — do not modify ───────────────────────────────

    /**
     * Returns the great-circle distance in kilometres between two GPS
     * coordinates using the Haversine formula (Earth radius = 6 371 km).
     */
    haversineDistance(loc1: Location, loc2: Location): number {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(loc2.latitude  - loc1.latitude);
        const dLng = toRad(loc2.longitude - loc1.longitude);
        const lat1 = toRad(loc1.latitude);
        const lat2 = toRad(loc2.latitude);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Returns the travel time in minutes between two locations at a given speed.
     *   travelTimeMinutes = (distanceKm / speedKmh) × 60
     */
    travelTimeMinutes(loc1: Location, loc2: Location, speedKmh: number): number {
        return (this.haversineDistance(loc1, loc2) / speedKmh) * 60;
    }

    // ── Your implementation below ─────────────────────────────────────────────

    calculateRouteDuration(
        technician: Technician,
        boxes: Box[],
        routeIds: string[]
    ): number | null {
        
        if (routeIds.length === 0) return 0;

        // Create a map for O(1) box lookups
        const boxMap = new Map<string, Box>();
        for (const box of boxes) {
            boxMap.set(box.id, box);
        }

        let totalMinutes = 0;
        let currentLocation = technician.startLocation;

        for (const id of routeIds) {
            const nextBox = boxMap.get(id);
            if (!nextBox) return null; // Unknown ID found

            totalMinutes += this.travelTimeMinutes(currentLocation, nextBox.location, technician.speedKmh);
            totalMinutes += nextBox.fixTimeMinutes;

            currentLocation = nextBox.location;
        }

        return totalMinutes;
    }

    planDay(technician: Technician, boxes: Box[]): DayPlanResult {
        
        const unvisited = new Set(boxes);
        const plannedRoute: string[] = [];
        let totalTimeUsedMinutes = 0;
        let currentLocation = technician.startLocation;

        while (unvisited.size > 0) {
            let bestBox: Box | null = null;
            let lowestCost = Infinity;

            for (const box of unvisited) {
                const travelTime = this.travelTimeMinutes(currentLocation, box.location, technician.speedKmh);
                const cost = travelTime + box.fixTimeMinutes;
                
                // Only consider the box if it has the lowest cost SO FAR and fits in the remaining budget
                if (cost < lowestCost && (totalTimeUsedMinutes + cost) <= technician.workingMinutes) {
                    lowestCost = cost;
                    bestBox = box;
                }
            }

            // If no remaining box fits in the budget, our day is done
            if (!bestBox) break;

            plannedRoute.push(bestBox.id);
            totalTimeUsedMinutes += lowestCost;
            currentLocation = bestBox.location;
            unvisited.delete(bestBox);
        }

        const skippedBoxIds = Array.from(unvisited).map(b => b.id);
        
        return {
            technicianId: technician.id,
            plannedRoute,
            totalTimeUsedMinutes,
            boxesFixed: plannedRoute.length,
            skippedBoxIds
        };
    }
}
