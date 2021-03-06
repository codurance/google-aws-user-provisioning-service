import {IAwsGroup} from "./IAwsGroup";

export interface IAwsGroupRepository {
    getAllGroups(): Promise<IAwsGroup[]>;
    createGroup(name: string): Promise<string>;
    deleteGroup(id: string): Promise<void>;
    addMemberToGroup(userId: string, groupId: string): Promise<void>;
    removeGroupMembers(groupId: string): Promise<void>
}
