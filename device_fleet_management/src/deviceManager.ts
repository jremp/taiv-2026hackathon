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

export class DeviceManager {

    // constructor, gets called when a new instance of the class is created
    constructor() {
    }

    addDevice(device: Device): void {
    }

    removeDevice(id: string): void {
    }

    getDevice(id: string): Device | null {
      return null;
    }

    getDevicesByVersion(version: string): Device[] | null {
      return null;
    }

    getDevicesByUserId(user_id: string): Device[] | null {
      return null;
    }

    getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] | null {
      return null;
    }

    getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given latitude and longitude
      // the radius is in kilometers
      return null;
    }

    getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given device (not including the device itself)
      // the radius is in kilometers
      return null;
    }

    getAllDevices(): Device[] {
        return [];
    }

    getDeviceCount(): number {
        return 0;
    }
}
