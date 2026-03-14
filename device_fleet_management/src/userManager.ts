export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export class UserManager {

  private users: Map<string, User> = new Map();

  addUser(user: User): void {
    if (!user.id) {
      throw new Error('User must have an id');
    } else if (this.users.has(user.id)) {
      throw new Error('User with id ' + user.id + ' already exists')
    }
    this.users.set(user.id, user);
  }

  removeUser(id: string): void {
    const user: User | null = this.users.get(id) || null;
    if (!user) {
      throw new Error('User with id ' + id + ' not found');
    } else {
      this.users.delete(user.id);
    }
  }

  getUser(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUsersByEmail(email: string): User[] | null {
    const matches: User[] = [];

    for (const user of this.users.values()) {
      if (user.email === email) {
        matches.push(user);
      }
    }
    return matches;
  }

  getUsersByPhone(phone: string): User[] | null {
    // TODO: Consider special phone formatting?
    const matches: User[] = [];

    for (const user of this.users.values()) {
      if (user.phone === phone) {
        matches.push(user);
      }
    }
    return matches;
  }

  getAllUsers(): User[] {
    return [...this.users.values()];
  }

  getUserCount(): number {
    return this.users.size;
  }
}
