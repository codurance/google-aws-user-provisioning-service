import {IAwsGroupMember} from "./IAwsGroupMember";

export interface IAwsGroup {
    id: string;
    displayName: string;
    members: IAwsGroupMember[]
}
