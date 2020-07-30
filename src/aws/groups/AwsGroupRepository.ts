import {IAwsGroup} from "../IAwsGroup";
import {IAwsConfig} from "../IAwsConfig";
import {IFetcher} from "../../IFetcher";

export class AwsGroupRepository {
    constructor(private awsConfig: IAwsConfig, private fetcher: IFetcher) {
    }

    async getAllGroups(): Promise<IAwsGroup[]> {
        let targetUrl = this.awsConfig.scimUrl + 'Groups?itemsPerPage=1000';
        const response = await this.fetcher.fetch({
            url: targetUrl,
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        let responseText = response.body;
        const responseBody = JSON.parse(responseText);
        const groups: IAwsGroup[] = responseBody.Resources.map((u: any) => ({
            displayName: u.displayName
        }));
        return groups;
    }

    async createGroup(name: string, description: string): Promise<string> {
        let scimCreateUser = {
            schemas: [
                'urn:ietf:params:scim:schemas:core:2.0:Group'
            ],
            displayName: name,
            description
        };

        let targetUrl = this.awsConfig.scimUrl + 'Groups';
        const response = await this.fetcher.fetch({
            url: targetUrl,
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(scimCreateUser)
        });

        const responseBody = JSON.parse(response.body);

        return responseBody.id;
    }

    async createGroupMembership(userId: string, groupId: string): Promise<void> {
        return;
    }

    private getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.awsConfig.scimToken}`,
            'Content-Type': 'application/scim+json'
        };
    }
}
