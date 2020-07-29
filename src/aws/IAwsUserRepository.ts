import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUser} from "./IAwsUser";

export interface IAwsUserRepository {
    getAllUsers(): Promise<IAwsUser>;

    createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult>,
}
