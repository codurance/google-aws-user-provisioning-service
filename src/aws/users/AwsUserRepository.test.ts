import {AwsUserRepository} from "./AwsUserRepository";
import {FetchRequest} from "../../IFetcher";
import {MockFetcher} from "../../test-util/MockFetcher";
import {assertAuthWasPassed} from "../test-util/assertAuthWasPassed";

describe('AWS User repository', () => {
    let repo: AwsUserRepository;
    let fetcher: MockFetcher;

    beforeEach(() => {
        fetcher = new MockFetcher();
        repo = new AwsUserRepository({
            scimUrl: 'HTTP://SCIMURL/',
            scimToken: 'SCIM_TOKEN'
        }, fetcher);
    });


    test('it can create a user', async () => {
        fetcher.givenTheNextResponseIs({
            id: "NEW_ID",
        });

        const result = await repo.createUser('John', 'Smith', 'Johnny Smith', 'john@smith.com');
        expect(result.successful).toBeTruthy();
        expect(result.id).toEqual('NEW_ID');

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users');
        expect(requestInfo.method).toEqual('POST');
        assertAuthWasPassed(requestInfo);
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

    test('can get all users', async () => {
        fetcher.givenTheNextResponseIs({
            totalResults: 1,
            itemsPerPage: 1,
            startIndex: 1,
            schemas: [
                'urn:ietf:params:scim:api:messages:2.0:ListResponse'
            ],
            Resources: [
                {
                    id: 'JOHN_ID',
                    userName: 'john@smith.com',
                    name: {
                        familyName: 'Smith',
                        givenName: 'John'
                    },
                    displayName: 'Johnny Smith',
                    active: true,
                    emails: [
                        {
                            value: 'john@smith.com',
                            type: 'work',
                            primary: true
                        }
                    ]
                }
            ]
        });

        const result = await repo.getAllUsers();
        expect(result.length).toEqual(1);
        let firstUser = result[0];
        expect(firstUser.firstName).toEqual('John');
        expect(firstUser.lastName).toEqual('Smith');
        expect(firstUser.displayName).toEqual('Johnny Smith');
        expect(firstUser.email).toEqual('john@smith.com');
        expect(firstUser.id).toEqual('JOHN_ID');

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users?itemsPerPage=1000');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });

    test('can delete user', async () => {
        await repo.deleteUser('test');

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users/test');
        expect(requestInfo.method).toEqual('DELETE');
        assertAuthWasPassed(requestInfo);
    });
});

