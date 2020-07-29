import {IAwsUser} from "./IAwsUser";
import {ICreateUserResult} from "./ICreateUserResult";
import {IAwsUserRepository} from "./IAwsUserRepository";
import {IAwsConfig} from "./IAwsConfig";
const request = require('request');
/*
    This repo implementation uses the SCIM protocol described at
    Ref: https://tools.ietf.org/html/rfc7644
    Schemas: https://tools.ietf.org/html/rfc7643#section-8.1
    AWS SCIM: https://docs.aws.amazon.com/singlesignon/latest/userguide/provision-automatically.html#how-to-with-scim
*/
export class AwsUserRepository implements IAwsUserRepository {
    constructor(private awsConfig: IAwsConfig) {
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

        const response = await fetch(this.awsConfig.scimUrl, {
            method: 'POST',
            headers: new Headers({
                'Authentication': `Bearer ${this.awsConfig.scimToken}`,
                'Content-Type': 'application/scim+json'
            }),
            body: JSON.stringify(scimCreateUser)
        });

        const responseBody = JSON.parse(await response.text());

        return {
            successful: true,
            id: responseBody.id
        };
    }

    async getAllUsers(): Promise<IAwsUser[]> {
        return [];
    }
}
