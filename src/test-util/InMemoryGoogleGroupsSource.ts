import {IGoogleGroupSource} from "../google/groups/IGoogleGroupSource";
import {IGoogleGroup} from "../google/groups/IGoogleGroup";
import {IGoogleGroupMembership} from "../google/groups/IGoogleGroupMembership";
import assert from "assert";

export class InMemoryGoogleGroupsSource implements IGoogleGroupSource{
    public allGroups: IGoogleGroup[] = [];
    public groupMemberships = new Map<string, IGoogleGroupMembership[]>();

    public addGroupMembership(groupId: string, membership: IGoogleGroupMembership): void {
        if(!this.groupMemberships.has(groupId))
            this.groupMemberships.set(groupId, []);
        const thisGroupsMemberships = this.groupMemberships.get(groupId);
        assert(thisGroupsMemberships);
        thisGroupsMemberships.push(membership);
    }

    async getGroups(): Promise<IGoogleGroup[]> {
        return [...this.allGroups];
    }

    async getGroupMemberships(groupId: string): Promise<IGoogleGroupMembership[]> {
        let membershipsForThisGroup = this.groupMemberships.get(groupId) || [];
        return [...membershipsForThisGroup];
    }
}
