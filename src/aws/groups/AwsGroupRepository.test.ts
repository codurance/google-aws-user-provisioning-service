import {AwsUserRepository} from "../users/AwsUserRepository";
import {MockFetcher} from "../../test-util/MockFetcher";
import {AwsGroupRepository} from "./AwsGroupRepository";
import {assertAuthWasPassed} from "../test-util/assertAuthWasPassed";

describe('AwsGroupRepository', () => {
    let repo: AwsGroupRepository;
    let fetcher: MockFetcher;

    beforeEach(() => {
        fetcher = new MockFetcher();
        repo = new AwsGroupRepository({
            scimUrl: 'HTTP://SCIMURL/',
            scimToken: 'SCIM_TOKEN'
        }, fetcher);
    });

    test('can get all groups', async () => {
        fetcher.givenTheNextResponseIs({
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

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups?itemsPerPage=1000');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });

    test('can create group', async () => {
        fetcher.givenTheNextResponseIs({
            id: "NEW_ID",
        });

        let newGroupId = await repo.createGroup('Admins', 'Admin group');
        expect(newGroupId).toEqual("NEW_ID");

        const requestInfo = fetcher.assertOneRequestAndReturn();
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

});
