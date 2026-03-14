export interface Device {
  id: string;
  name: string;
  version: string;
  user_id: string;
  status: 'active' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

export class DeviceManager {

  private devices: Map<string, Device> = new Map();

  // constructor, gets called when a new instance of the class is created
  constructor() {
  }

  addDevice(device: Device): void {

    if (!device.id) {
      throw new Error('Device must have an id');
    } else if (this.devices.has(device.id)) {
      throw new Error('Device with id ' + device.id + ' already exists')
    }
    this.devices.set(device.id, device);
  }

  removeDevice(id: string): void {
    const device: Device | null = this.devices.get(id) || null;
    if (!device) {
      throw new Error('Device with id ' + id + ' not found');
    } else {
      this.devices.delete(device.id);
    }
  }

  getDevice(id: string): Device | null {
    return this.devices.get(id) || null;
  }

  getDevicesByVersion(version: string): Device[] | null {
    const matches: Device[] = [];

    for (const device of this.devices.values()) {
      if (device.version === version) {
        matches.push(device);
      }
    }
    return matches;
  }

  getDevicesByUserId(user_id: string): Device[] | null {
    const matches: Device[] = [];

    for (const device of this.devices.values()) {
      if (device.user_id === user_id) {
        matches.push(device);
      }
    }
    return matches;
  }

  getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] | null {
    const matches: Device[] = [];

    for (const device of this.devices.values()) {
      if (device.status === status) {
        matches.push(device);
      }
    }
    return matches;
  }

  getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] | null {
    // returns all devices within a radius of the given latitude and longitude
    // the radius is in kilometers
    const matches: Device[] = [];

    const location: Location = { latitude, longitude };
    for (const device of this.devices.values()) {
      const distance = this.haversineDistance(location, device.location);
      if (distance <= radius_km) {
        matches.push(device);
      }
    }
    return matches;
  }

  getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
    // returns all devices within a radius of the given device (not including the device itself)
    // the radius is in kilometers
    if (!device_id || !this.devices.has(device_id)) {
      return null;
    } else {
      const matches: Device[] = [];

      const location: Location = this.devices.get(device_id)!.location;
      for (const device of this.devices.values()) {
        if (device.id !== device_id) {
          const distance = this.haversineDistance(location, device.location);
          if (distance <= radius_km) {
            matches.push(device);
          }
        }
      }
      return matches;
    }
  }

  getAllDevices(): Device[] {
    return [...this.devices.values()];
  }

  getDeviceCount(): number {
    return this.devices.size;
  }

  // Taken from the technician_dispatch problem
  private haversineDistance(loc1: Location, loc2: Location): number {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLng = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
