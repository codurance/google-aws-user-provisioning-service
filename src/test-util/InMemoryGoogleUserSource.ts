import {IGoogleUserSource} from "../google/users/IGoogleUserSource";
import {IGoogleUser} from "../google/users/IGoogleUser";

export class InMemoryGoogleUserSource implements IGoogleUserSource {
    public allUsers: IGoogleUser[] = [];

    async getUsers(): Promise<IGoogleUser[]> {
        return this.allUsers;
    }
}
