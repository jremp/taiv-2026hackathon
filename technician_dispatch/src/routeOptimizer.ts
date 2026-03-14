/**
 * CHALLENGE 1: Single Technician — Shortest Route
 *
 * A technician starts at a known GPS location and must visit every broken
 * box exactly once. Your goal is to find the shortest possible total travel
 * distance.
 *
 * Scoring:
 *   - Correctness  — every box visited exactly once, distance is accurate.
 *   - Route quality — your total distance is compared against other teams;
 *                     shorter routes score higher on the load tests.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;   // decimal degrees
    longitude: number;  // decimal degrees
}

export interface Box {
    id: string;
    name: string;
    location: Location;
}

export interface Technician {
    id: string;
    name: string;
    startLocation: Location;
}

export interface RouteResult {
    technicianId: string;
    /** Ordered list of box IDs. Every box must appear exactly once. */
    route: string[];
    /** Total travel distance in km. Does NOT include a return leg to start. */
    totalDistanceKm: number;
}

export class RouteOptimizer {

    // ── Pre-implemented helper — do not modify ────────────────────────────────

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

    // ── Your implementation below ─────────────────────────────────────────────

    calculateRouteDistance(
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

        let totalDistanceKm = 0;
        let currentLocation = technician.startLocation;

        for (const id of routeIds) {
            const nextBox = boxMap.get(id);
            if (!nextBox) return null; // Unknown ID found

            totalDistanceKm += this.haversineDistance(currentLocation, nextBox.location);
            currentLocation = nextBox.location;
        }

        return totalDistanceKm;
    }

    findShortestRoute(technician: Technician, boxes: Box[]): RouteResult {
        // 1. Initial Nearest-Neighbor Route
        const unvisited = new Set(boxes);
        const routeBoxes: Box[] = [];
        let currentLocation = technician.startLocation;

        while (unvisited.size > 0) {
            let nearestBox: Box | null = null;
            let shortestDist = Infinity;

            for (const box of unvisited) {
                const dist = this.haversineDistance(currentLocation, box.location);
                if (dist < shortestDist) {
                    shortestDist = dist;
                    nearestBox = box;
                }
            }

            if (nearestBox) {
                routeBoxes.push(nearestBox);
                currentLocation = nearestBox.location;
                unvisited.delete(nearestBox);
            }
        }

        // 2. 2-Opt Optimization
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 0; i < routeBoxes.length - 1; i++) {
                for (let k = i + 1; k < routeBoxes.length; k++) {
                    const loc1 = i === 0 ? technician.startLocation : routeBoxes[i - 1].location;
                    const loc2 = routeBoxes[i].location;
                    const loc3 = routeBoxes[k].location;
                    const loc4 = k === routeBoxes.length - 1 ? null : routeBoxes[k + 1].location;

                    let currentDist = this.haversineDistance(loc1, loc2);
                    if (loc4) currentDist += this.haversineDistance(loc3, loc4);

                    let newDist = this.haversineDistance(loc1, loc3);
                    if (loc4) newDist += this.haversineDistance(loc2, loc4);

                    // If swapping edges reduces distance, reverse the segment
                    if (newDist < currentDist - 0.00001) { 
                        const reversedSegment = routeBoxes.slice(i, k + 1).reverse();
                        routeBoxes.splice(i, reversedSegment.length, ...reversedSegment);
                        improved = true;
                    }
                }
            }
        }

        // 3. Final Calculation
        let totalDistanceKm = 0;
        let curr = technician.startLocation;
        const route = [];
        
        for (const box of routeBoxes) {
            totalDistanceKm += this.haversineDistance(curr, box.location);
            curr = box.location;
            route.push(box.id);
        }

        return {
            technicianId: technician.id,
            route,
            totalDistanceKm
        };
    }
}
