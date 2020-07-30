import {IGoogleGroup} from "./IGoogleGroup";
import {IGoogleGroupMembership} from "./IGoogleGroupMembership";

export interface IGoogleGroupSource {
    getGroups(): Promise<IGoogleGroup[]>;
    getGroupMemberships(groupId: string): Promise<IGoogleGroupMembership[]>;
}
