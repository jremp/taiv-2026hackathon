import { FleetManager, DeviceManager, UserManager, Device, User } from '../src/fleetManager';

describe('FleetManager', () => {
    let fleetManager: FleetManager;
    let deviceManager: DeviceManager;
    let userManager: UserManager;

    beforeEach(() => {
        deviceManager = new DeviceManager();
        userManager = new UserManager();
        fleetManager = new FleetManager(deviceManager, userManager);
    });

    // Helper functions
    const createTestUser = (id: string, overrides: Partial<User> = {}): User => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        phone: `555-000-${id.padStart(4, '0')}`,
        address: `${id} Test Street`,
        ...overrides,
    });

    const createTestDevice = (id: string, userId: string, overrides: Partial<Device> = {}): Device => ({
        id,
        name: `Device ${id}`,
        version: '1.0.0',
        user_id: userId,
        status: 'active',
        location: {
            latitude: 0,
            longitude: 0,
        },
        ...overrides,
    });

    describe('constructor', () => {
        it('should create a FleetManager with device and user managers', () => {
            expect(fleetManager.deviceManager).toBe(deviceManager);
            expect(fleetManager.userManager).toBe(userManager);
        });

        it('should start with zero users and devices', () => {
            expect(fleetManager.getUserCount()).toBe(0);
            expect(fleetManager.getDeviceCount()).toBe(0);
        });
    });

    describe('addUser', () => {
        it('should add a user successfully', () => {
            const user = createTestUser('1');
            fleetManager.addUser(user);
            expect(fleetManager.getUser('1')).toEqual(user);
        });

        it('should increment user count', () => {
            fleetManager.addUser(createTestUser('1'));
            expect(fleetManager.getUserCount()).toBe(1);
        });

        it('should throw error when adding user without id', () => {
            const user = { id: '', name: 'Test', email: 'test@test.com', phone: '555', address: '123' };
            expect(() => fleetManager.addUser(user)).toThrow('User must have an id');
        });

        it('should throw error when adding duplicate user', () => {
            const user = createTestUser('1');
            fleetManager.addUser(user);
            expect(() => fleetManager.addUser(user)).toThrow('User with id 1 already exists');
        });
    });

    describe('getUser', () => {
        it('should return user when found', () => {
            const user = createTestUser('1');
            fleetManager.addUser(user);
            expect(fleetManager.getUser('1')).toEqual(user);
        });

        it('should return null when user not found', () => {
            expect(fleetManager.getUser('nonexistent')).toBeNull();
        });
    });

    describe('removeUser', () => {
        it('should remove user and their devices', () => {
            const user = createTestUser('1');
            fleetManager.addUser(user);
            
            const device1 = createTestDevice('d1', '1');
            const device2 = createTestDevice('d2', '1');
            fleetManager.addDevice(device1);
            fleetManager.addDevice(device2);
            
            expect(fleetManager.getDeviceCount()).toBe(2);
            
            fleetManager.removeUser('1');
            
            expect(fleetManager.getUser('1')).toBeNull();
            expect(fleetManager.getDevice('d1')).toBeNull();
            expect(fleetManager.getDevice('d2')).toBeNull();
            expect(fleetManager.getDeviceCount()).toBe(0);
        });

        it('should throw error when removing non-existent user', () => {
            expect(() => fleetManager.removeUser('999')).toThrow('User with id 999 not found');
        });

        it('should not affect devices of other users', () => {
            const user1 = createTestUser('1');
            const user2 = createTestUser('2');
            fleetManager.addUser(user1);
            fleetManager.addUser(user2);
            
            const device1 = createTestDevice('d1', '1');
            const device2 = createTestDevice('d2', '2');
            fleetManager.addDevice(device1);
            fleetManager.addDevice(device2);
            
            fleetManager.removeUser('1');
            
            expect(fleetManager.getDevice('d1')).toBeNull();
            expect(fleetManager.getDevice('d2')).toEqual(device2);
        });
    });

    describe('addDevice', () => {
        it('should add a device when user exists', () => {
            const user = createTestUser('1');
            fleetManager.addUser(user);
            
            const device = createTestDevice('d1', '1');
            fleetManager.addDevice(device);
            
            expect(fleetManager.getDevice('d1')).toEqual(device);
        });

        it('should throw error when user does not exist', () => {
            const device = createTestDevice('d1', 'nonexistent');
            expect(() => fleetManager.addDevice(device)).toThrow('Cannot add device: User with id nonexistent not found');
        });

        it('should increment device count', () => {
            fleetManager.addUser(createTestUser('1'));
            fleetManager.addDevice(createTestDevice('d1', '1'));
            expect(fleetManager.getDeviceCount()).toBe(1);
        });

        it('should throw error when adding device without id', () => {
            fleetManager.addUser(createTestUser('1'));
            const device: Device = { id: '', name: 'Test', version: '1.0', user_id: '1', status: 'active', location: { latitude: 0, longitude: 0 } };
            expect(() => fleetManager.addDevice(device)).toThrow('Device must have an id');
        });
    });

    describe('getDevice', () => {
        it('should return device when found', () => {
            fleetManager.addUser(createTestUser('1'));
            const device = createTestDevice('d1', '1');
            fleetManager.addDevice(device);
            expect(fleetManager.getDevice('d1')).toEqual(device);
        });

        it('should return null when device not found', () => {
            expect(fleetManager.getDevice('nonexistent')).toBeNull();
        });
    });

    describe('removeDevice', () => {
        it('should remove an existing device', () => {
            fleetManager.addUser(createTestUser('1'));
            const device = createTestDevice('d1', '1');
            fleetManager.addDevice(device);
            
            fleetManager.removeDevice('d1');
            expect(fleetManager.getDevice('d1')).toBeNull();
        });

        it('should throw error when removing non-existent device', () => {
            expect(() => fleetManager.removeDevice('999')).toThrow('Device with id 999 not found');
        });

        it('should decrement device count', () => {
            fleetManager.addUser(createTestUser('1'));
            fleetManager.addDevice(createTestDevice('d1', '1'));
            fleetManager.addDevice(createTestDevice('d2', '1'));
            
            fleetManager.removeDevice('d1');
            expect(fleetManager.getDeviceCount()).toBe(1);
        });
    });

    describe('getUserDevices', () => {
        it('should return all devices for a user', () => {
            fleetManager.addUser(createTestUser('1'));
            const device1 = createTestDevice('d1', '1');
            const device2 = createTestDevice('d2', '1');
            fleetManager.addDevice(device1);
            fleetManager.addDevice(device2);
            
            const devices = fleetManager.getUserDevices('1');
            expect(devices).toHaveLength(2);
            expect(devices).toContainEqual(device1);
            expect(devices).toContainEqual(device2);
        });

        it('should return empty array when user has no devices', () => {
            fleetManager.addUser(createTestUser('1'));
            expect(fleetManager.getUserDevices('1')).toEqual([]);
        });

        it('should return empty array for non-existent user', () => {
            expect(fleetManager.getUserDevices('nonexistent')).toEqual([]);
        });
    });

    describe('getUserCount', () => {
        it('should return 0 for empty fleet', () => {
            expect(fleetManager.getUserCount()).toBe(0);
        });

        it('should return correct count', () => {
            fleetManager.addUser(createTestUser('1'));
            fleetManager.addUser(createTestUser('2'));
            expect(fleetManager.getUserCount()).toBe(2);
        });
    });

    describe('getDeviceCount', () => {
        it('should return 0 for empty fleet', () => {
            expect(fleetManager.getDeviceCount()).toBe(0);
        });

        it('should return correct count', () => {
            fleetManager.addUser(createTestUser('1'));
            fleetManager.addDevice(createTestDevice('d1', '1'));
            fleetManager.addDevice(createTestDevice('d2', '1'));
            expect(fleetManager.getDeviceCount()).toBe(2);
        });
    });

    // Load Testing with 100 accounts
    describe('Load Testing - 100 Users', () => {
        const LOAD_TEST_SIZE = 100;

        it('should handle adding 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
            }
            expect(fleetManager.getUserCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should handle 100 users with multiple devices each', () => {
            // Add 100 users, each with 3 devices
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                for (let j = 0; j < 3; j++) {
                    fleetManager.addDevice(createTestDevice(`d${i}_${j}`, String(i)));
                }
            }
            expect(fleetManager.getUserCount()).toBe(LOAD_TEST_SIZE);
            expect(fleetManager.getDeviceCount()).toBe(LOAD_TEST_SIZE * 3);
        });

        it('should handle getting devices for each of 100 users', () => {
            // Setup: 100 users with 2 devices each
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                fleetManager.addDevice(createTestDevice(`d${i}_1`, String(i)));
                fleetManager.addDevice(createTestDevice(`d${i}_2`, String(i)));
            }
            
            // Verify each user's devices
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const devices = fleetManager.getUserDevices(String(i));
                expect(devices).toHaveLength(2);
            }
        });

        it('should handle removing users with cascading device deletion for 100 users', () => {
            // Setup: 100 users with 2 devices each
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                fleetManager.addDevice(createTestDevice(`d${i}_1`, String(i)));
                fleetManager.addDevice(createTestDevice(`d${i}_2`, String(i)));
            }
            
            expect(fleetManager.getDeviceCount()).toBe(200);
            
            // Remove half the users
            for (let i = 0; i < LOAD_TEST_SIZE; i += 2) {
                fleetManager.removeUser(String(i));
            }
            
            expect(fleetManager.getUserCount()).toBe(50);
            expect(fleetManager.getDeviceCount()).toBe(100);
        });

        it('should handle rapid add/remove cycles with 100 users', () => {
            // Add all users
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
            }
            
            // Remove all
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.removeUser(String(i));
            }
            
            expect(fleetManager.getUserCount()).toBe(0);
            
            // Add again
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
            }
            
            expect(fleetManager.getUserCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should maintain referential integrity with 100 users and 300 devices', () => {
            // Add 100 users with 3 devices each
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                for (let j = 0; j < 3; j++) {
                    fleetManager.addDevice(createTestDevice(`d${i}_${j}`, String(i)));
                }
            }
            
            // Remove some users and verify their devices are gone
            for (let i = 0; i < 10; i++) {
                fleetManager.removeUser(String(i));
                for (let j = 0; j < 3; j++) {
                    expect(fleetManager.getDevice(`d${i}_${j}`)).toBeNull();
                }
            }
            
            // Remaining users should still have their devices
            for (let i = 10; i < LOAD_TEST_SIZE; i++) {
                const devices = fleetManager.getUserDevices(String(i));
                expect(devices).toHaveLength(3);
            }
        });

        it('should handle device-only operations across 100 users', () => {
            // Setup: 100 users with varying device counts
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                const deviceCount = (i % 5) + 1; // 1-5 devices per user
                for (let j = 0; j < deviceCount; j++) {
                    fleetManager.addDevice(createTestDevice(`d${i}_${j}`, String(i)));
                }
            }
            
            // Total devices should be sum of 1+2+3+4+5 repeated 20 times = 15 * 20 = 300
            expect(fleetManager.getDeviceCount()).toBe(300);
            
            // Remove individual devices
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.removeDevice(`d${i}_0`);
            }
            
            expect(fleetManager.getDeviceCount()).toBe(200);
        });

        it('should handle concurrent-like lookups on 100 users', () => {
            // Setup
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addUser(createTestUser(String(i)));
                fleetManager.addDevice(createTestDevice(`d${i}`, String(i)));
            }
            
            // Simulate many random lookups
            const results: (User | null)[] = [];
            const deviceResults: (Device | null)[] = [];
            
            for (let i = 0; i < 1000; i++) {
                const randomUserId = String(Math.floor(Math.random() * LOAD_TEST_SIZE));
                results.push(fleetManager.getUser(randomUserId));
                deviceResults.push(fleetManager.getDevice(`d${randomUserId}`));
            }
            
            // All lookups should succeed
            expect(results.every(r => r !== null)).toBe(true);
            expect(deviceResults.every(r => r !== null)).toBe(true);
        });

        it('should handle edge case: user with maximum devices', () => {
            fleetManager.addUser(createTestUser('poweruser'));
            
            // Add 100 devices to a single user
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                fleetManager.addDevice(createTestDevice(`device_${i}`, 'poweruser'));
            }
            
            expect(fleetManager.getUserDevices('poweruser')).toHaveLength(LOAD_TEST_SIZE);
            
            // Remove user should remove all devices
            fleetManager.removeUser('poweruser');
            expect(fleetManager.getDeviceCount()).toBe(0);
        });
    });
});
