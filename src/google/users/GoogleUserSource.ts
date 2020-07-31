import {IGoogleUserSource} from "./IGoogleUserSource";
import {IGoogleUser} from "./IGoogleUser";
import {IGoogleApiConfig} from "../IGoogleApiConfig"
import {getGoogleDirectoryService} from "../GetGoogleDirectoryService";
import assert from "assert";

export class GoogleUserSource implements IGoogleUserSource {
    constructor(private googleApiConfig: IGoogleApiConfig) {
    }

    public async getUsers(): Promise<IGoogleUser[]> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let usersResult = await service.users.list(this.getCustomerParam());
        assert(usersResult.data.users);
        const users: IGoogleUser[] = usersResult.data.users.map((u: any) => ({
            primaryEmail: u.primaryEmail,
            fullName: u.name.fullName,
            firstName: u.name.firstName,
            lastName: u.name.lastName,
            id: u.id,
        } as IGoogleUser));
        return users;
    }

    private getCustomerParam(): { customer: string } {
        return {
            customer: this.googleApiConfig.googleAppOrganisationId
        };
    }

    async getGroups(): Promise<any> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let groupResult = await service.groups.list(this.getCustomerParam());
        assert(groupResult.data.groups);
        return groupResult.data.groups.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description
        }));
    }

    async getGroupMemberships(groupId: string): Promise<any> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let memberResult = await service.members.list({
            groupKey: groupId
        });
        let members = memberResult.data.members || [];
        return members.map((m: any) => ({
            id: m.id,
            email: m.id
        }));
    }
}

