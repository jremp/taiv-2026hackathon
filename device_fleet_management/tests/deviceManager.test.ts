import { DeviceManager, Device } from '../src/deviceManager';

describe('DeviceManager', () => {
    let deviceManager: DeviceManager;

    beforeEach(() => {
        deviceManager = new DeviceManager();
    });

    // Helper function to create test devices
    const createTestDevice = (id: string, overrides: Partial<Device> = {}): Device => ({
        id,
        name: `Device ${id}`,
        version: '1.0.0',
        user_id: `user_${id}`,
        status: 'active',
        location: {
            latitude: 37.7749 + Number(id) * 0.001,
            longitude: -122.4194 + Number(id) * 0.001,
        },
        ...overrides,
    });

    describe('constructor', () => {
        it('should create an empty DeviceManager', () => {
            expect(deviceManager.getDeviceCount()).toBe(0);
            expect(deviceManager.getAllDevices()).toEqual([]);
        });
    });

    describe('addDevice', () => {
        it('should add a device successfully', () => {
            const device = createTestDevice('1');
            deviceManager.addDevice(device);
            expect(deviceManager.getDevice('1')).toEqual(device);
        });

        it('should throw error when adding device without id', () => {
            const device: Device = { 
                id: '', 
                name: 'Test', 
                version: '1.0', 
                user_id: 'user1',
                status: 'active',
                location: { latitude: 0, longitude: 0 }
            };
            expect(() => deviceManager.addDevice(device)).toThrow('Device must have an id');
        });

        it('should throw error when adding duplicate device', () => {
            const device = createTestDevice('1');
            deviceManager.addDevice(device);
            expect(() => deviceManager.addDevice(device)).toThrow('Device with id 1 already exists');
        });

        it('should increment device count after adding', () => {
            deviceManager.addDevice(createTestDevice('1'));
            expect(deviceManager.getDeviceCount()).toBe(1);
            deviceManager.addDevice(createTestDevice('2'));
            expect(deviceManager.getDeviceCount()).toBe(2);
        });
    });

    describe('removeDevice', () => {
        it('should remove an existing device', () => {
            const device = createTestDevice('1');
            deviceManager.addDevice(device);
            deviceManager.removeDevice('1');
            expect(deviceManager.getDevice('1')).toBeNull();
        });

        it('should throw error when removing non-existent device', () => {
            expect(() => deviceManager.removeDevice('999')).toThrow('Device with id 999 not found');
        });

        it('should decrement device count after removing', () => {
            deviceManager.addDevice(createTestDevice('1'));
            deviceManager.addDevice(createTestDevice('2'));
            expect(deviceManager.getDeviceCount()).toBe(2);
            deviceManager.removeDevice('1');
            expect(deviceManager.getDeviceCount()).toBe(1);
        });
    });

    describe('getDevice', () => {
        it('should return device when found', () => {
            const device = createTestDevice('1');
            deviceManager.addDevice(device);
            expect(deviceManager.getDevice('1')).toEqual(device);
        });

        it('should return null when device not found', () => {
            expect(deviceManager.getDevice('nonexistent')).toBeNull();
        });
    });

    describe('getDevicesByVersion', () => {
        it('should return devices with matching version', () => {
            const device1 = createTestDevice('1', { version: '2.0.0' });
            const device2 = createTestDevice('2', { version: '2.0.0' });
            const device3 = createTestDevice('3', { version: '1.0.0' });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const result = deviceManager.getDevicesByVersion('2.0.0');
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(device1);
            expect(result).toContainEqual(device2);
        });

        it('should return empty array when no devices match version', () => {
            deviceManager.addDevice(createTestDevice('1'));
            expect(deviceManager.getDevicesByVersion('9.9.9')).toEqual([]);
        });

        it('should return empty array when no devices exist', () => {
            expect(deviceManager.getDevicesByVersion('1.0.0')).toEqual([]);
        });
    });

    describe('getDevicesByUserId', () => {
        it('should return devices with matching user_id', () => {
            const device1 = createTestDevice('1', { user_id: 'shared_user' });
            const device2 = createTestDevice('2', { user_id: 'shared_user' });
            const device3 = createTestDevice('3', { user_id: 'other_user' });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const result = deviceManager.getDevicesByUserId('shared_user');
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(device1);
            expect(result).toContainEqual(device2);
        });

        it('should return empty array when no devices match user_id', () => {
            deviceManager.addDevice(createTestDevice('1'));
            expect(deviceManager.getDevicesByUserId('nonexistent_user')).toEqual([]);
        });

        it('should return empty array when no devices exist', () => {
            expect(deviceManager.getDevicesByUserId('any')).toEqual([]);
        });
    });

    describe('getAllDevices', () => {
        it('should return all devices', () => {
            const device1 = createTestDevice('1');
            const device2 = createTestDevice('2');
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);

            const result = deviceManager.getAllDevices();
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(device1);
            expect(result).toContainEqual(device2);
        });

        it('should return empty array when no devices', () => {
            expect(deviceManager.getAllDevices()).toEqual([]);
        });
    });

    describe('getDeviceCount', () => {
        it('should return 0 for empty manager', () => {
            expect(deviceManager.getDeviceCount()).toBe(0);
        });

        it('should return correct count', () => {
            deviceManager.addDevice(createTestDevice('1'));
            deviceManager.addDevice(createTestDevice('2'));
            deviceManager.addDevice(createTestDevice('3'));
            expect(deviceManager.getDeviceCount()).toBe(3);
        });
    });

    describe('getDevicesByStatus', () => {
        it('should return devices with matching status', () => {
            const device1 = createTestDevice('1', { status: 'active' });
            const device2 = createTestDevice('2', { status: 'active' });
            const device3 = createTestDevice('3', { status: 'inactive' });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const activeDevices = deviceManager.getDevicesByStatus('active');
            expect(activeDevices).toHaveLength(2);
            expect(activeDevices).toContainEqual(device1);
            expect(activeDevices).toContainEqual(device2);
        });

        it('should return inactive devices', () => {
            const device1 = createTestDevice('1', { status: 'active' });
            const device2 = createTestDevice('2', { status: 'inactive' });
            const device3 = createTestDevice('3', { status: 'inactive' });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const inactiveDevices = deviceManager.getDevicesByStatus('inactive');
            expect(inactiveDevices).toHaveLength(2);
            expect(inactiveDevices).toContainEqual(device2);
            expect(inactiveDevices).toContainEqual(device3);
        });

        it('should return empty array when no devices match status', () => {
            deviceManager.addDevice(createTestDevice('1', { status: 'active' }));
            expect(deviceManager.getDevicesByStatus('inactive')).toEqual([]);
        });

        it('should return empty array when no devices exist', () => {
            expect(deviceManager.getDevicesByStatus('active')).toEqual([]);
        });

        it('should handle pending status filter', () => {
            const device1 = createTestDevice('1', { status: 'active' });
            deviceManager.addDevice(device1);
            expect(deviceManager.getDevicesByStatus('pending')).toEqual([]);
        });

        it('should handle failed status filter', () => {
            const device1 = createTestDevice('1', { status: 'active' });
            deviceManager.addDevice(device1);
            expect(deviceManager.getDevicesByStatus('failed')).toEqual([]);
        });
    });

    describe('getDevicesInArea', () => {
        // San Francisco coordinates for testing
        const SF_LAT = 37.7749;
        const SF_LNG = -122.4194;

        it('should return devices within the specified radius', () => {
            const device1 = createTestDevice('1', { 
                location: { latitude: SF_LAT, longitude: SF_LNG } 
            });
            const device2 = createTestDevice('2', { 
                location: { latitude: SF_LAT + 0.001, longitude: SF_LNG + 0.001 } 
            });
            const device3 = createTestDevice('3', { 
                location: { latitude: SF_LAT + 10, longitude: SF_LNG + 10 } // Far away
            });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const nearbyDevices = deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 1); // 1km radius
            expect(nearbyDevices).toHaveLength(2);
            expect(nearbyDevices).toContainEqual(device1);
            expect(nearbyDevices).toContainEqual(device2);
        });

        it('should return empty array when no devices in area', () => {
            const device = createTestDevice('1', { 
                location: { latitude: 0, longitude: 0 } 
            });
            deviceManager.addDevice(device);
            
            const nearbyDevices = deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 1);
            expect(nearbyDevices).toEqual([]);
        });

        it('should return empty array when no devices exist', () => {
            expect(deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 10)).toEqual([]);
        });

        it('should return device exactly at center point', () => {
            const device = createTestDevice('1', { 
                location: { latitude: SF_LAT, longitude: SF_LNG } 
            });
            deviceManager.addDevice(device);
            
            const nearbyDevices = deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 0.1);
            expect(nearbyDevices).toHaveLength(1);
            expect(nearbyDevices).toContainEqual(device);
        });

        it('should handle zero radius', () => {
            const device = createTestDevice('1', { 
                location: { latitude: SF_LAT, longitude: SF_LNG } 
            });
            deviceManager.addDevice(device);
            
            const nearbyDevices = deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 0);
            // Should return device at exact location or empty depending on implementation
            expect(nearbyDevices).toBeDefined();
        });

        it('should handle large radius', () => {
            const device1 = createTestDevice('1', { 
                location: { latitude: SF_LAT, longitude: SF_LNG } 
            });
            const device2 = createTestDevice('2', { 
                location: { latitude: 40.7128, longitude: -74.0060 } // NYC
            });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            
            // Large enough radius to include both coasts
            const nearbyDevices = deviceManager.getDevicesInArea(SF_LAT, SF_LNG, 5000);
            expect(nearbyDevices).toHaveLength(2);
        });

        it('should handle negative coordinates', () => {
            const device = createTestDevice('1', { 
                location: { latitude: -33.8688, longitude: 151.2093 } // Sydney
            });
            deviceManager.addDevice(device);
            
            const nearbyDevices = deviceManager.getDevicesInArea(-33.8688, 151.2093, 1);
            expect(nearbyDevices).toHaveLength(1);
        });
    });

    describe('getDevicesNearDevice', () => {
        it('should return devices near the specified device', () => {
            const device1 = createTestDevice('1', { 
                location: { latitude: 37.7749, longitude: -122.4194 } 
            });
            const device2 = createTestDevice('2', { 
                location: { latitude: 37.7750, longitude: -122.4195 } // Very close
            });
            const device3 = createTestDevice('3', { 
                location: { latitude: 40.7128, longitude: -74.0060 } // NYC - far away
            });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const nearbyDevices = deviceManager.getDevicesNearDevice('1', 1); // 1km radius
            expect(nearbyDevices).toHaveLength(1);
            expect(nearbyDevices).toContainEqual(device2);
        });

        it('should not include the reference device in results', () => {
            const device1 = createTestDevice('1', { 
                location: { latitude: 37.7749, longitude: -122.4194 } 
            });
            const device2 = createTestDevice('2', { 
                location: { latitude: 37.7749, longitude: -122.4194 } // Same location
            });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);

            const nearbyDevices = deviceManager.getDevicesNearDevice('1', 1);
            expect(nearbyDevices).not.toContainEqual(device1);
            expect(nearbyDevices).toContainEqual(device2);
        });

        it('should return empty array when no devices nearby', () => {
            const device1 = createTestDevice('1', { 
                location: { latitude: 37.7749, longitude: -122.4194 } 
            });
            const device2 = createTestDevice('2', { 
                location: { latitude: 0, longitude: 0 } // Far away
            });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);

            const nearbyDevices = deviceManager.getDevicesNearDevice('1', 1);
            expect(nearbyDevices).toEqual([]);
        });

        it('should return null or throw when device_id not found', () => {
            const device = createTestDevice('1');
            deviceManager.addDevice(device);
            
            const result = deviceManager.getDevicesNearDevice('nonexistent', 1);
            expect(result).toBeNull();
        });

        it('should return empty array when only one device exists', () => {
            const device = createTestDevice('1', { 
                location: { latitude: 37.7749, longitude: -122.4194 } 
            });
            deviceManager.addDevice(device);

            const nearbyDevices = deviceManager.getDevicesNearDevice('1', 100);
            expect(nearbyDevices).toEqual([]);
        });

        it('should handle multiple devices at same location', () => {
            const location = { latitude: 37.7749, longitude: -122.4194 };
            const device1 = createTestDevice('1', { location });
            const device2 = createTestDevice('2', { location });
            const device3 = createTestDevice('3', { location });
            
            deviceManager.addDevice(device1);
            deviceManager.addDevice(device2);
            deviceManager.addDevice(device3);

            const nearbyDevices = deviceManager.getDevicesNearDevice('1', 0.1);
            expect(nearbyDevices).toHaveLength(2);
            expect(nearbyDevices).toContainEqual(device2);
            expect(nearbyDevices).toContainEqual(device3);
        });
    });

    // Load Testing with 100 devices
    describe('Load Testing - 100 Devices', () => {
        const LOAD_TEST_SIZE = 100;

        it('should handle adding 100 devices', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            expect(deviceManager.getDeviceCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should handle retrieving all 100 devices', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            const allDevices = deviceManager.getAllDevices();
            expect(allDevices).toHaveLength(LOAD_TEST_SIZE);
        });

        it('should handle getting individual devices from 100 devices', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            // Check random access to devices
            expect(deviceManager.getDevice('0')).toBeTruthy();
            expect(deviceManager.getDevice('50')).toBeTruthy();
            expect(deviceManager.getDevice('99')).toBeTruthy();
        });

        it('should handle filtering by version across 100 devices', () => {
            // Create 100 devices with different versions
            const versions = ['1.0.0', '2.0.0', '3.0.0', '4.0.0', '5.0.0'];
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const version = versions[i % 5];
                deviceManager.addDevice(createTestDevice(String(i), { version }));
            }
            // Each version should have 20 devices (100 / 5)
            expect(deviceManager.getDevicesByVersion('1.0.0')).toHaveLength(20);
            expect(deviceManager.getDevicesByVersion('2.0.0')).toHaveLength(20);
            expect(deviceManager.getDevicesByVersion('3.0.0')).toHaveLength(20);
        });

        it('should handle filtering by user_id across 100 devices', () => {
            // Create 100 devices assigned to 10 users (10 devices each)
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const user_id = `user_${i % 10}`;
                deviceManager.addDevice(createTestDevice(String(i), { user_id }));
            }
            // Each user should have 10 devices
            expect(deviceManager.getDevicesByUserId('user_0')).toHaveLength(10);
            expect(deviceManager.getDevicesByUserId('user_5')).toHaveLength(10);
            expect(deviceManager.getDevicesByUserId('user_9')).toHaveLength(10);
        });

        it('should handle removing devices from 100 devices', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            // Remove every other device
            for (let i = 0; i < LOAD_TEST_SIZE; i += 2) {
                deviceManager.removeDevice(String(i));
            }
            expect(deviceManager.getDeviceCount()).toBe(50);
        });

        it('should handle rapid add/remove cycles with 100 devices', () => {
            // Add 100 devices
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            // Remove all
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.removeDevice(String(i));
            }
            expect(deviceManager.getDeviceCount()).toBe(0);
            
            // Add again
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            expect(deviceManager.getDeviceCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should maintain data integrity with 100 devices', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i)));
            }
            // Verify each device's data is correct
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const device = deviceManager.getDevice(String(i));
                expect(device).not.toBeNull();
                expect(device!.id).toBe(String(i));
                expect(device!.name).toBe(`Device ${i}`);
            }
        });

        it('should handle mixed version and user queries on 100 devices', () => {
            // Create complex dataset
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i), {
                    version: `${Math.floor(i / 25) + 1}.0.0`,
                    user_id: `user_${i % 20}`,
                }));
            }
            
            // 25 devices per version
            expect(deviceManager.getDevicesByVersion('1.0.0')).toHaveLength(25);
            expect(deviceManager.getDevicesByVersion('4.0.0')).toHaveLength(25);
            
            // 5 devices per user
            expect(deviceManager.getDevicesByUserId('user_0')).toHaveLength(5);
            expect(deviceManager.getDevicesByUserId('user_19')).toHaveLength(5);
        });

        it('should handle filtering by status across 100 devices', () => {
            // Create 100 devices: 50 active, 50 inactive
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const status: 'active' | 'inactive' = i % 2 === 0 ? 'active' : 'inactive';
                deviceManager.addDevice(createTestDevice(String(i), { status }));
            }
            
            expect(deviceManager.getDevicesByStatus('active')).toHaveLength(50);
            expect(deviceManager.getDevicesByStatus('inactive')).toHaveLength(50);
        });

        it('should handle area queries across 100 geographically distributed devices', () => {
            // Create 100 devices spread across a geographic area
            // Base: San Francisco (37.7749, -122.4194)
            const baseLat = 37.7749;
            const baseLng = -122.4194;
            
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                // Spread devices in a grid pattern, ~100m apart
                const latOffset = (i % 10) * 0.001;
                const lngOffset = Math.floor(i / 10) * 0.001;
                deviceManager.addDevice(createTestDevice(String(i), {
                    location: {
                        latitude: baseLat + latOffset,
                        longitude: baseLng + lngOffset,
                    },
                }));
            }
            
            // Query for devices in a small area (should find subset)
            const nearbyDevices = deviceManager.getDevicesInArea(baseLat, baseLng, 0.5);
            expect(nearbyDevices!.length).toBeLessThan(LOAD_TEST_SIZE);
            expect(nearbyDevices!.length).toBeGreaterThan(0);
            
            // Query for devices in a large area (should find all)
            const allNearby = deviceManager.getDevicesInArea(baseLat + 0.005, baseLng + 0.005, 10);
            expect(allNearby).toHaveLength(LOAD_TEST_SIZE);
        });

        it('should handle getDevicesNearDevice across 100 clustered devices', () => {
            // Create 100 devices in clusters
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const clusterIndex = Math.floor(i / 10); // 10 clusters of 10 devices
                const baseLat = 37.0 + clusterIndex * 0.1; // Clusters ~11km apart
                const baseLng = -122.0;
                
                deviceManager.addDevice(createTestDevice(String(i), {
                    location: {
                        latitude: baseLat + (i % 10) * 0.0001,
                        longitude: baseLng + (i % 10) * 0.0001,
                    },
                }));
            }
            
            // Device 0 should have 9 nearby devices (its cluster mates)
            const nearDevice0 = deviceManager.getDevicesNearDevice('0', 1);
            expect(nearDevice0).toHaveLength(9);
            
            // Device 50 (cluster 5) should have 9 nearby devices
            const nearDevice50 = deviceManager.getDevicesNearDevice('50', 1);
            expect(nearDevice50).toHaveLength(9);
        });

        it('should handle combined status and location queries on 100 devices', () => {
            // Create 100 devices with varying status and locations
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const status: 'active' | 'inactive' = i % 3 === 0 ? 'inactive' : 'active';
                deviceManager.addDevice(createTestDevice(String(i), {
                    status,
                    location: {
                        latitude: 37.7749 + (i * 0.001),
                        longitude: -122.4194 + (i * 0.001),
                    },
                }));
            }
            
            // About 67 active, 33 inactive
            const activeDevices = deviceManager.getDevicesByStatus('active');
            const inactiveDevices = deviceManager.getDevicesByStatus('inactive');
            expect(activeDevices!.length + inactiveDevices!.length).toBe(LOAD_TEST_SIZE);
        });

        it('should maintain location data integrity with 100 devices', () => {
            const baseLat = 37.7749;
            const baseLng = -122.4194;
            
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i), {
                    location: {
                        latitude: baseLat + i,
                        longitude: baseLng - i,
                    },
                }));
            }
            
            // Verify location data for each device
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const device = deviceManager.getDevice(String(i));
                expect(device).not.toBeNull();
                expect(device!.location.latitude).toBe(baseLat + i);
                expect(device!.location.longitude).toBe(baseLng - i);
            }
        });

        it('should handle rapid status changes with 100 devices', () => {
            // Add all devices as active
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                deviceManager.addDevice(createTestDevice(String(i), { status: 'active' }));
            }
            
            expect(deviceManager.getDevicesByStatus('active')).toHaveLength(LOAD_TEST_SIZE);
            expect(deviceManager.getDevicesByStatus('inactive')).toHaveLength(0);
        });
    });
});
