import {IAwsGroupRepository} from "../aws/groups/IAwsGroupRepository";
import {IAwsGroup} from "../aws/groups/IAwsGroup";

export class InMemoryAwsGroupRepo implements IAwsGroupRepository{
    public allGroups: IAwsGroup[] = [];
    async createGroup(name: string, description: string): Promise<string> {
        let id = Math.random().toString();
        this.allGroups.push({
            displayName: name,
            id: id,
            description: description,
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
}
