import {AwsUserRepository} from "./AwsUserRepository";
import {MockFetcher} from "../../test-util/MockFetcher";
import {assertAuthWasPassed} from "../test-util/assertAuthWasPassed";
import {IAwsUser} from "./IAwsUser";

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
        fetcher.queueUpNextResponse({
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


    test('can get user by email', async () => {
        fetcher.queueUpNextResponse({
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

        const firstUser = await repo.getUserByEmail("john@smith.com");
        assertDetailsAreJohnSmiths(firstUser as IAwsUser);
        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users?filter=userName eq "john@smith.com"');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });

    test('can get user by email when user does not exist', async () => {
        fetcher.queueUpNextResponse({
            totalResults: 1,
            itemsPerPage: 1,
            startIndex: 1,
            schemas: [
                'urn:ietf:params:scim:api:messages:2.0:ListResponse'
            ],
            Resources: []
        });

        const firstUser = await repo.getUserByEmail("john@smith.com");
        expect(firstUser).toBeNull();
    });


    function assertDetailsAreJohnSmiths(firstUser: IAwsUser) {
        expect(firstUser.firstName).toEqual('John');
        expect(firstUser.lastName).toEqual('Smith');
        expect(firstUser.displayName).toEqual('Johnny Smith');
        expect(firstUser.email).toEqual('john@smith.com');
        expect(firstUser.id).toEqual('JOHN_ID');
    }

    test('can get 50 random users', async () => {
        let firstResponse = createResponseContainingJustJohnSmith();
        fetcher.queueUpNextResponse(firstResponse);

        const randomUsers = await repo.get50RandomUsers();
        const firstUser = randomUsers[0];
        assertDetailsAreJohnSmiths(firstUser);

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });


    function createResponseContainingJustJohnSmith() {
        return {
            totalResults: 50,
            itemsPerPage: 50,
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
        };
    }

    test('can get 50 random users', async () => {
        let firstResponse = createResponseContainingJustJohnSmith();
        fetcher.queueUpNextResponse(firstResponse);

        const result = await repo.get50RandomUsers();

        expect(result.length).toEqual(1);
        expect(fetcher.requests.length).toEqual(1);
        expect(fetcher.requests[0].url).toEqual('HTTP://SCIMURL/Users');
    });

    test('can delete user', async () => {
        fetcher.queueUpNextResponse({});
        await repo.deleteUser('test');

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users/test');
        expect(requestInfo.method).toEqual('DELETE');
        assertAuthWasPassed(requestInfo);
    });
});

