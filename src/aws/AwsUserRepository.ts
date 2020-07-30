import {IAwsUser} from "./IAwsUser";
import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUserRepository} from "./IAwsUserRepository";
import {IAwsConfig} from "./IAwsConfig";
import {IAwsGroup} from "./IAwsGroup";
import {IFetcher} from "../IFetcher";
const fetch = require('node-fetch');
const Headers = fetch.Headers;
/*
    This repo implementation uses the SCIM protocol described at
    Ref: https://tools.ietf.org/html/rfc7644
    Schemas: https://tools.ietf.org/html/rfc7643#section-8.1
    AWS SCIM: https://docs.aws.amazon.com/singlesignon/latest/userguide/provision-automatically.html#how-to-with-scim
*/
export class AwsUserRepository implements IAwsUserRepository {
    constructor(private awsConfig: IAwsConfig, private fetcher: IFetcher) {
    }

    async createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult> {
        let scimCreateUser = {
            schemas: [
                'urn:ietf:params:scim:schemas:core:2.0:User'
            ],
            userName: email,
            name: {
                familyName: lastName,
                givenName: firstName
            },
            displayName: displayName,
            active: true,
            emails: [
                {
                    value: email,
                    type: 'work',
                    primary: true
                }
            ]
        };

        const response = await this.fetcher.fetch({
            url: this.awsConfig.scimUrl + 'Users',
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(scimCreateUser)
        });

        const responseBody = JSON.parse(response.body);

        return {
            successful: true,
            id: responseBody.id
        };
    }

    async getAllUsers(): Promise<IAwsUser[]> {
        let targetUrl = this.awsConfig.scimUrl + 'Users?itemsPerPage=1000';
        const response = await this.fetcher.fetch({
            url: targetUrl,
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        let responseText = await response.body;
        const responseBody = JSON.parse(responseText);
        const users: IAwsUser[] = responseBody.Resources.map((u: any) => ({
            firstName: u.name.givenName,
            lastName: u.name.familyName,
            displayName: u.displayName,
            email: u.userName
        }));
        return users;
    }

    private getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.awsConfig.scimToken}`,
            'Content-Type': 'application/scim+json'
        };
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
}
