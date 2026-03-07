# Device Fleet Management

A simulated fleet management system for a tech company. Your team is implementing test driven development and as such they have written tests to outline all of the required functionality. Your task is to implement the core manager classes that handle users, devices, and their relationships.

**DO NOT modify any of the test files or any of the function signatures.** When evaluating we will be running tests to check for valid implementations, and your score on this section will be proportional to the amount of tests that pass relative to other teams

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Tests are located in the `tests/` folder. Your goal is to make all tests pass by implementing the functionality in the `src/` folder.

---

## Your Challenge

You need to implement three manager classes. The method signatures and interfaces are already defined—you just need to fill in the logic.

### 1. UserManager (`src/userManager.ts`)

Manages user accounts in the system.

**Data Model:**
```typescript
interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}
```

**Methods to Implement:**

| Method | Description |
|--------|-------------|
| `addUser(user)` | Add a new user. Should throw if `id` is empty or already exists. |
| `removeUser(id)` | Remove a user by ID. Should throw if user doesn't exist. |
| `getUser(id)` | Return user by ID, or `null` if not found. |
| `getUsersByEmail(email)` | Return all users with matching email. |
| `getUsersByPhone(phone)` | Return all users with matching phone. |
| `getAllUsers()` | Return all users. |
| `getUserCount()` | Return total number of users. |

---

### 2. DeviceManager (`src/deviceManager.ts`)

Manages IoT devices with location tracking.

**Data Model:**
```typescript
interface Device {
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
```

**Methods to Implement:**

| Method | Description |
|--------|-------------|
| `addDevice(device)` | Add a new device. Should throw if `id` is empty or already exists. |
| `removeDevice(id)` | Remove a device by ID. Should throw if device doesn't exist. |
| `getDevice(id)` | Return device by ID, or `null` if not found. |
| `getDevicesByVersion(version)` | Return all devices with matching firmware version. |
| `getDevicesByUserId(user_id)` | Return all devices owned by a user. |
| `getDevicesByStatus(status)` | Return all devices with matching status. |
| `getDevicesInArea(lat, lng, radius_km)` | Return all devices within `radius_km` kilometers of the coordinates. |
| `getDevicesNearDevice(device_id, radius_km)` | Return all devices within `radius_km` of another device (excluding that device). Returns `null` if device_id not found. |
| `getAllDevices()` | Return all devices. |
| `getDeviceCount()` | Return total number of devices. |

**Hint for geo queries:** Use the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) to calculate distance between two lat/lng points:

---

### 3. FleetManager (`src/fleetManager.ts`)

Orchestrates users and devices with business logic for relationships.

**Methods to Implement:**

| Method | Description |
|--------|-------------|
| `removeUser(id)` | Remove a user **AND all their associated devices**. |
| `addDevice(device)` | Add a device, but **only if its `user_id` references a valid user**. Throw an error if the user doesn't exist. |

The other methods delegate to the underlying managers and are already wired up.

---

## Test Coverage

The test suite includes:

- **Unit tests** for each method
- **Error handling** (invalid IDs, duplicates, missing records)
- **Load tests** with 100 users/devices to ensure your implementation scales

Run `npm run test` to test out your implementation.

---

## Project Structure

```
device_fleet_management/
├── src/
│   ├── userManager.ts      # Implement user CRUD
│   ├── deviceManager.ts    # Implement device CRUD + geo queries
│   └── fleetManager.ts     # Implement relationship logic
├── tests/
│   ├── userManager.test.ts
│   ├── deviceManager.test.ts
│   └── fleetManager.test.ts
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## Tips

1. **Run tests frequently** with `npm test` to check your progress
2. **Read the test file** if you're unsure what a method should do
3. **Don't modify the interfaces** — the tests expect specific signatures
