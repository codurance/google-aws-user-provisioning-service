import {IAwsGroupRepository} from "../aws/groups/IAwsGroupRepository";
import {IAwsGroup} from "../aws/groups/IAwsGroup";

export class InMemoryAwsGroupRepo implements IAwsGroupRepository{
    public allGroups: IAwsGroup[] = [];
    public newMemberships: {userId: string, groupId: string}[] = [];

    async createGroup(name: string, description: string): Promise<string> {
        let id = Math.random().toString();
        this.allGroups.push({
            displayName: name,
            id: id,
            members: []
        });

        return id;
    }

    async getAllGroups(): Promise<IAwsGroup[]> {
        return [...this.allGroups];
    }

    async deleteGroup(id: string): Promise<void> {
        this.allGroups = this.allGroups.filter(g => g.id !== id);
    }

    async addMemberToGroup(userId: string, groupId: string): Promise<void> {
        this.newMemberships.push({userId, groupId})
    }

    async removeGroupMembers(groupId: string): Promise<void> {
        this.newMemberships = this.newMemberships.filter(m => m.groupId == groupId);
    }

}
