import {IAwsGroup} from "./IAwsGroup";

export interface IAwsGroupRepository {
    getAllGroups(): Promise<IAwsGroup[]>;
    createGroup(name: string, description: string): Promise<string>;
    deleteGroup(id: string): Promise<void>;
}
