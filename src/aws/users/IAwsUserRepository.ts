import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUser} from "./IAwsUser";

export interface IAwsUserRepository {
    getAllUsers(): Promise<IAwsUser[]>;
    deleteUser(id: string): Promise<void>
    createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult>,
}
