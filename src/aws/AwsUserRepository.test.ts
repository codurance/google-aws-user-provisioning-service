import {AwsUserRepository} from "./AwsUserRepository";
// @ts-ignore
import {FetchMock} from "jest-fetch-mock";
require('jest-fetch-mock').enableMocks();
const fetch = require('jest-fetch-mock') as FetchMock;

describe('AWS User repository', () => {
    test('it can create a user', async () => {
        const repo = new AwsUserRepository({
            scimUrl: 'HTTP://SCIMURL',
            scimToken: 'SCIM_TOKEN'
        });

        fetch.mockResponseOnce(JSON.stringify({
            id: "NEW_ID",
        }));

        const result = await repo.createUser('John', 'Smith', 'Johnny Smith', 'john@smith.com');
        expect(result.successful).toBeTruthy();
        expect(result.id).toEqual('NEW_ID');

        const calls = fetch.mock.calls;
        expect(calls.length).toEqual(1);
        const urlToFetch: string = calls[0][0];
        const requestInfo: Request = calls[0][1];
        const contentTypeHeader = requestInfo.headers.get('Content-Type');
        const authenticationHeader = requestInfo.headers.get('Authentication');

        expect(urlToFetch).toEqual('HTTP://SCIMURL');
        expect(requestInfo.method).toEqual('POST');
        expect(contentTypeHeader).toBe('application/scim+json');
        expect(authenticationHeader).toBe('Bearer SCIM_TOKEN');
        const bodyString = requestInfo.body as any as string;
        const newUserEntity = JSON.parse(bodyString);
        expect(newUserEntity.displayName).toBe('Johnny Smith');
        expect(newUserEntity.userName).toBe('john@smith.com');
        expect(newUserEntity.name.familyName).toBe('Smith');
        expect(newUserEntity.name.givenName).toBe('John');
        expect(newUserEntity.active).toBe(true);
        expect(newUserEntity.emails.length).toBe(1);
        let firstEmail = newUserEntity.emails[0];
        expect(firstEmail.value).toBe('john@smith.com');
        expect(firstEmail.type).toBe('work');
        expect(firstEmail.primary).toBe(true);
        expect(newUserEntity.schemas.length).toBe(1);
        expect(newUserEntity.schemas[0]).toBe('urn:ietf:params:scim:schemas:core:2.0:User');
    });
});
