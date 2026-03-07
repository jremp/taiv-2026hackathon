import { UserManager, User } from '../src/userManager';

describe('UserManager', () => {
    let userManager: UserManager;

    beforeEach(() => {
        userManager = new UserManager();
    });

    // Helper function to create test users
    const createTestUser = (id: string, overrides: Partial<User> = {}): User => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        phone: `555-000-${id.padStart(4, '0')}`,
        address: `${id} Test Street`,
        ...overrides,
    });

    describe('constructor', () => {
        it('should create an empty UserManager', () => {
            expect(userManager.getUserCount()).toBe(0);
            expect(userManager.getAllUsers()).toEqual([]);
        });
    });

    describe('addUser', () => {
        it('should add a user successfully', () => {
            const user = createTestUser('1');
            userManager.addUser(user);
            expect(userManager.getUser('1')).toEqual(user);
        });

        it('should throw error when adding user without id', () => {
            const user = { id: '', name: 'Test', email: 'test@test.com', phone: '555-1234', address: '123 St' };
            expect(() => userManager.addUser(user)).toThrow('User must have an id');
        });

        it('should throw error when adding duplicate user', () => {
            const user = createTestUser('1');
            userManager.addUser(user);
            expect(() => userManager.addUser(user)).toThrow('User with id 1 already exists');
        });

        it('should increment user count after adding', () => {
            userManager.addUser(createTestUser('1'));
            expect(userManager.getUserCount()).toBe(1);
            userManager.addUser(createTestUser('2'));
            expect(userManager.getUserCount()).toBe(2);
        });
    });

    describe('removeUser', () => {
        it('should remove an existing user', () => {
            const user = createTestUser('1');
            userManager.addUser(user);
            userManager.removeUser('1');
            expect(userManager.getUser('1')).toBeNull();
        });

        it('should throw error when removing non-existent user', () => {
            expect(() => userManager.removeUser('999')).toThrow('User with id 999 not found');
        });

        it('should decrement user count after removing', () => {
            userManager.addUser(createTestUser('1'));
            userManager.addUser(createTestUser('2'));
            expect(userManager.getUserCount()).toBe(2);
            userManager.removeUser('1');
            expect(userManager.getUserCount()).toBe(1);
        });
    });

    describe('getUser', () => {
        it('should return user when found', () => {
            const user = createTestUser('1');
            userManager.addUser(user);
            expect(userManager.getUser('1')).toEqual(user);
        });

        it('should return null when user not found', () => {
            expect(userManager.getUser('nonexistent')).toBeNull();
        });
    });

    describe('getUsersByEmail', () => {
        it('should return users with matching email', () => {
            const user1 = createTestUser('1', { email: 'shared@example.com' });
            const user2 = createTestUser('2', { email: 'shared@example.com' });
            const user3 = createTestUser('3', { email: 'different@example.com' });
            
            userManager.addUser(user1);
            userManager.addUser(user2);
            userManager.addUser(user3);

            const result = userManager.getUsersByEmail('shared@example.com');
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(user1);
            expect(result).toContainEqual(user2);
        });

        it('should return empty array when no users match email', () => {
            userManager.addUser(createTestUser('1'));
            expect(userManager.getUsersByEmail('nomatch@example.com')).toEqual([]);
        });

        it('should return empty array when no users exist', () => {
            expect(userManager.getUsersByEmail('any@example.com')).toEqual([]);
        });
    });

    describe('getUsersByPhone', () => {
        it('should return users with matching phone', () => {
            const user1 = createTestUser('1', { phone: '555-SHARED' });
            const user2 = createTestUser('2', { phone: '555-SHARED' });
            const user3 = createTestUser('3', { phone: '555-OTHER' });
            
            userManager.addUser(user1);
            userManager.addUser(user2);
            userManager.addUser(user3);

            const result = userManager.getUsersByPhone('555-SHARED');
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(user1);
            expect(result).toContainEqual(user2);
        });

        it('should return empty array when no users match phone', () => {
            userManager.addUser(createTestUser('1'));
            expect(userManager.getUsersByPhone('000-0000')).toEqual([]);
        });

        it('should return empty array when no users exist', () => {
            expect(userManager.getUsersByPhone('any')).toEqual([]);
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', () => {
            const user1 = createTestUser('1');
            const user2 = createTestUser('2');
            userManager.addUser(user1);
            userManager.addUser(user2);

            const result = userManager.getAllUsers();
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(user1);
            expect(result).toContainEqual(user2);
        });

        it('should return empty array when no users', () => {
            expect(userManager.getAllUsers()).toEqual([]);
        });
    });

    describe('getUserCount', () => {
        it('should return 0 for empty manager', () => {
            expect(userManager.getUserCount()).toBe(0);
        });

        it('should return correct count', () => {
            userManager.addUser(createTestUser('1'));
            userManager.addUser(createTestUser('2'));
            userManager.addUser(createTestUser('3'));
            expect(userManager.getUserCount()).toBe(3);
        });
    });

    // Load Testing with 100 accounts
    describe('Load Testing - 100 Users', () => {
        const LOAD_TEST_SIZE = 100;

        it('should handle adding 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            expect(userManager.getUserCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should handle retrieving all 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            const allUsers = userManager.getAllUsers();
            expect(allUsers).toHaveLength(LOAD_TEST_SIZE);
        });

        it('should handle getting individual users from 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            // Check random access to users
            expect(userManager.getUser('0')).toBeTruthy();
            expect(userManager.getUser('50')).toBeTruthy();
            expect(userManager.getUser('99')).toBeTruthy();
        });

        it('should handle filtering by email across 100 users', () => {
            // Create 100 users, 10 with the same email
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const email = i % 10 === 0 ? 'common@example.com' : `user${i}@example.com`;
                userManager.addUser(createTestUser(String(i), { email }));
            }
            const commonEmailUsers = userManager.getUsersByEmail('common@example.com');
            expect(commonEmailUsers).toHaveLength(10);
        });

        it('should handle filtering by phone across 100 users', () => {
            // Create 100 users, 20 with the same phone
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const phone = i % 5 === 0 ? '555-COMMON' : `555-${i.toString().padStart(4, '0')}`;
                userManager.addUser(createTestUser(String(i), { phone }));
            }
            const commonPhoneUsers = userManager.getUsersByPhone('555-COMMON');
            expect(commonPhoneUsers).toHaveLength(20);
        });

        it('should handle removing users from 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            // Remove every other user
            for (let i = 0; i < LOAD_TEST_SIZE; i += 2) {
                userManager.removeUser(String(i));
            }
            expect(userManager.getUserCount()).toBe(50);
        });

        it('should handle rapid add/remove cycles with 100 users', () => {
            // Add 100 users
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            // Remove all
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.removeUser(String(i));
            }
            expect(userManager.getUserCount()).toBe(0);
            
            // Add again
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            expect(userManager.getUserCount()).toBe(LOAD_TEST_SIZE);
        });

        it('should maintain data integrity with 100 users', () => {
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                userManager.addUser(createTestUser(String(i)));
            }
            // Verify each user's data is correct
            for (let i = 0; i < LOAD_TEST_SIZE; i++) {
                const user = userManager.getUser(String(i));
                expect(user).not.toBeNull();
                expect(user!.id).toBe(String(i));
                expect(user!.name).toBe(`User ${i}`);
            }
        });
    });
});
