import { User } from '../entities/User';

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findByRole(role: string): Promise<User[]>;
    findByUserType(userType: number): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
}
