import {IGoogleUserSource} from "../google/IGoogleUserSource";
import {IGoogleUser} from "../google/IGoogleUser";

export class InMemoryGoogleUserSource implements IGoogleUserSource {
    public allUsers: IGoogleUser[] = [];

    async getUsers(): Promise<IGoogleUser[]> {
        return this.allUsers;
    }
}
