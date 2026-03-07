export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export class UserManager {

    addUser(user: User): void {
    }

    removeUser(id: string): void {
    }

    getUser(id: string): User | null {
      return null;
    }

    getUsersByEmail(email: string): User[] | null {
      return null;
    }

    getUsersByPhone(phone: string): User[] | null {
      return null;
    }

    getAllUsers(): User[] {
        return [];
    }

    getUserCount(): number {
        return 0;
    }
}
