import {IGoogleGroup} from "./IGoogleGroup";

export interface IGoogleGroupSource {
    getGroups(): Promise<IGoogleGroup[]>;
}
