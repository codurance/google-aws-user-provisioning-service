import {IGoogleUser} from "./IGoogleUser";

export interface IGoogleUserSource {
    getUsers(): Promise<IGoogleUser[]>;
}

