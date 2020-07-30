import {IGoogleApiConfig} from "../IGoogleApiConfig"
import {getGoogleDirectoryService} from "../GetGoogleDirectoryService";
import {IGoogleGroupSource} from "./IGoogleGroupSource";
import {IGoogleGroupMembership} from "./IGoogleGroupMembership";

const {google} = require('googleapis');

export class GoogleGroupSource implements IGoogleGroupSource {
    constructor(private googleApiConfig: IGoogleApiConfig) {
    }

    private getCustomerParam(): { customer: string } {
        return {
            customer: this.googleApiConfig.googleAppOrganisationId
        };
    }

    async getGroups(): Promise<any> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let groupResult = await service.groups.list(this.getCustomerParam());
        return groupResult.data.groups.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description
        }));
    }

    async getGroupMemberships(groupId: string): Promise<IGoogleGroupMembership[]> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let memberResult = await service.members.list({
            groupKey: groupId
        });
        let members = memberResult.data.members || [];
        return members.map((m: any) => ({
            id: m.id,
            email: m.email
        }));
    }

}

