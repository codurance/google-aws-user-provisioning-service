import {AwsUserRepository} from "./AwsUserRepository";
import {FetchRequest, FetchResponse, IFetcher} from "../IFetcher";

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
        givenTheNextResponseIs({
            id: "NEW_ID",
        });

        const result = await repo.createUser('John', 'Smith', 'Johnny Smith', 'john@smith.com');
        expect(result.successful).toBeTruthy();
        expect(result.id).toEqual('NEW_ID');

        const requestInfo = assertOneRequestAndReturn();
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
        givenTheNextResponseIs({
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

        const requestInfo = assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Users?itemsPerPage=1000');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });


    test('can get all groups', async () => {
        givenTheNextResponseIs({
            totalResults: 1,
            itemsPerPage: 1,
            startIndex: 1,
            schemas: [
                'urn:ietf:params:scim:api:messages:2.0:ListResponse'
            ],
            Resources: [
                {
                    id: '9367030a8e-3b91f46b-95d6-497f-a519-ab79a9196b09',
                    meta: {
                        resourceType: 'Group',
                        created: '2020-07-17T15:30:24Z',
                        lastModified: '2020-07-17T15:30:24Z'
                    },
                    schemas: [
                        'urn:ietf:params:scim:schemas:core:2.0:Group'
                    ],
                    displayName: 'Admins',
                    members: []
                }
            ]
        });

        const result = await repo.getAllGroups();
        expect(result.length).toEqual(1);
        let firstGroup = result[0];
        expect(firstGroup.displayName).toEqual('Admins');

        const requestInfo = assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups?itemsPerPage=1000');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });

    test('can create group', async () => {
        givenTheNextResponseIs({
            id: "NEW_ID",
        });

        let newGroupId = await repo.createGroup('Admins', 'Admin group');
        expect(newGroupId).toEqual("NEW_ID");

        const requestInfo = assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups');
        expect(requestInfo.method).toEqual('POST');
        assertAuthWasPassed(requestInfo);
        const bodyString = requestInfo.body as any as string;
        const newGroup = JSON.parse(bodyString);
        expect(newGroup.displayName).toBe('Admins');
        expect(newGroup.description).toBe('Admin group');
        expect(newGroup.schemas.length).toBe(1);
        expect(newGroup.schemas[0]).toBe('urn:ietf:params:scim:schemas:core:2.0:Group');
    });

    function assertAuthWasPassed(requestInfo: FetchRequest) {
        const contentTypeHeader = requestInfo.headers['Content-Type'];
        const authenticationHeader = requestInfo.headers['Authorization'];
        expect(contentTypeHeader).toBe('application/scim+json');
        expect(authenticationHeader).toBe('Bearer SCIM_TOKEN');
    }

    function assertOneRequestAndReturn(): FetchRequest {
        const calls = fetcher.requests;
        expect(calls.length).toEqual(1);
        return calls[0];
    }

    function givenTheNextResponseIs(responseObject: any) {
        fetcher.nextResponse = {
            code: 200,
            body: JSON.stringify(responseObject)
        };
    }
});

class MockFetcher implements IFetcher {
    public nextResponse: FetchResponse;
    public requests: FetchRequest[] = [];
    async fetch(request: FetchRequest): Promise<FetchResponse> {
        this.requests.push(request);
        return this.nextResponse;
    }
}
