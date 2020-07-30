import {IGoogleGroupSource} from "../google/groups/IGoogleGroupSource";
import {IGoogleGroup} from "../google/groups/IGoogleGroup";

export class InMemoryGoogleGroupsSource implements IGoogleGroupSource{
    public allGroups: IGoogleGroup[] = [];
    async getGroups(): Promise<IGoogleGroup[]> {
        return [...this.allGroups];
    }
}
