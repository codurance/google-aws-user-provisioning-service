import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUser} from "./IAwsUser";
import {IAwsGroup} from "./IAwsGroup";

export interface IAwsUserRepository {
    getAllUsers(): Promise<IAwsUser[]>;
    getAllGroups(): Promise<IAwsGroup[]>
    createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult>,
}
