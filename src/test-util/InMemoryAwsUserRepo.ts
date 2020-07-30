import {IAwsUserRepository} from "../aws/users/IAwsUserRepository";
import {IAwsUser} from "../aws/users/IAwsUser";
import {ICreateUserResult} from "../aws/users/ICreateUserResult";
import {IAwsGroup} from "../aws/groups/IAwsGroup";

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

    async getAllUsers(): Promise<IAwsUser[]> {
        return [...this.allUsers];
    }

    async deleteUser(id: string): Promise<void> {
        this.allUsers = this.allUsers.filter(u => u.id !== id);
    }

}
