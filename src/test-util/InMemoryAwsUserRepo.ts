import {IAwsUserRepository} from "../aws/users/IAwsUserRepository";
import {IAwsUser} from "../aws/users/IAwsUser";
import {ICreateUserResult} from "../aws/users/ICreateUserResult";

export class InMemoryAwsUserRepo implements IAwsUserRepository {
    public allUsers: IAwsUser[] = [];
    public newUserId: string;

    async createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult> {
        this.allUsers.push({
            firstName,
            lastName,
            displayName,
            email,
            id: this.newUserId
        });
        return {
            id: this.newUserId,
            successful: true,
        }
    }

    async deleteUser(id: string): Promise<void> {
        this.allUsers = this.allUsers.filter(u => u.id !== id);
    }

    async getUserByEmail(email: string): Promise<IAwsUser | null> {
        let foundUser = this.allUsers.find(u => u.email === email);
        return foundUser || null;
    }

    async get50RandomUsers(): Promise<IAwsUser[]> {
        return this.allUsers.slice(0, Math.max(this.allUsers.length-1, 50))
    }

}
