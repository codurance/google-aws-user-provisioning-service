import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUser} from "./IAwsUser";

export interface IAwsUserRepository {
    getUserByEmail(email: string): Promise<IAwsUser | null>;
    deleteUser(id: string): Promise<void>;
    createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult>;
    get50RandomUsers(): Promise<IAwsUser[]>;
}
