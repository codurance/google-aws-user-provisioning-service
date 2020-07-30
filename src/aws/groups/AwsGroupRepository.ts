import {IAwsGroup} from "./IAwsGroup";
import {IAwsConfig} from "../IAwsConfig";
import {IFetcher} from "../../IFetcher";
import {IAwsGroupRepository} from "./IAwsGroupRepository";

export class AwsGroupRepository implements IAwsGroupRepository {
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
            displayName: u.displayName,
            id: u.id
        }));
        return groups;
    }

    async createGroup(name: string, description: string): Promise<string> {
        let scimCreateGroup = {
            schemas: [
                'urn:ietf:params:scim:schemas:core:2.0:Group'
            ],
            displayName: name
        };

        let targetUrl = this.awsConfig.scimUrl + 'Groups';
        const response = await this.fetcher.fetch({
            url: targetUrl,
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(scimCreateGroup)
        });

        const responseBody = JSON.parse(response.body);

        return responseBody.id;
    }

    private getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.awsConfig.scimToken}`,
            'Content-Type': 'application/scim+json'
        };
    }

    public async deleteGroup(id: string): Promise<void> {
        let targetUrl = `${this.awsConfig.scimUrl}Groups/${id}`;
        let result = await this.fetcher.fetch({
            url: targetUrl,
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

    }

    async addMemberToGroup(userId: string, groupId: string): Promise<void> {
        let request = this.createGroupMembershipPatchRequest('add', userId);
        let targetUrl = `${this.awsConfig.scimUrl}Groups/${groupId}`;
        await this.fetcher.fetch({
            url: targetUrl,
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });
    }

    private createGroupMembershipPatchRequest(op: string, userId: string) {
        let request = {
            Operations: [
                {
                    op: op,
                    path: 'members',
                    value: [
                        {
                            value: userId
                        }
                    ]
                }
            ]
        };
        return request;
    }

    async removeGroupMembers(groupId: string): Promise<void> {
        let request = {
            Operations: [
                {
                    op: 'remove',
                    path: 'members'
                }
            ]
        };
        let targetUrl = `${this.awsConfig.scimUrl}Groups/${groupId}`;
        await this.fetcher.fetch({
            url: targetUrl,
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });
    }
}
