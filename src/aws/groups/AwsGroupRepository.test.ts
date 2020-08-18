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
        fetcher.queueUpNextResponse({
            totalResults: 1,
            itemsPerPage: 1,
            startIndex: 1,
            schemas: [
                'urn:ietf:params:scim:api:messages:2.0:ListResponse'
            ],
            Resources: [
                {
                    id: 'GID1',
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
        expect(firstGroup.id).toEqual('GID1');

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups?itemsPerPage=1000');
        expect(requestInfo.method).toEqual('GET');
        assertAuthWasPassed(requestInfo);
    });

    test('can create group', async () => {
        fetcher.queueUpNextResponse({
            id: "NEW_ID",
        });

        let newGroupId = await repo.createGroup('Admins');
        expect(newGroupId).toEqual("NEW_ID");

        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups');
        expect(requestInfo.method).toEqual('POST');
        assertAuthWasPassed(requestInfo);
        const bodyString = requestInfo.body as any as string;
        const newGroup = JSON.parse(bodyString);
        expect(newGroup.displayName).toBe('Admins');
        expect(newGroup.schemas.length).toBe(1);
        expect(newGroup.schemas[0]).toBe('urn:ietf:params:scim:schemas:core:2.0:Group');
    });

    test('can delete group', async () => {
        fetcher.queueUpNextResponse({});
        await repo.deleteGroup('test');
        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups/test');
        expect(requestInfo.method).toEqual('DELETE');
        assertAuthWasPassed(requestInfo);
    });

    function assertGroupMemberOperation(op: string) {
        let body = assertPatchWasMadeToGroupAndReturnBody();
        expect(body.Operations[0].op).toEqual(op);
        expect(body.Operations[0].path).toEqual('members');
        expect(body.Operations[0].value.length).toEqual(1);
        expect(body.Operations[0].value[0].value).toEqual('userId');
    }

    test('can add member to group', async () => {
        fetcher.queueUpNextResponse({});

        await repo.addMemberToGroup('userId', 'groupId');
        assertGroupMemberOperation('add');
    });

    function assertPatchWasMadeToGroupAndReturnBody() {
        const requestInfo = fetcher.assertOneRequestAndReturn();
        expect(requestInfo.url).toEqual('HTTP://SCIMURL/Groups/groupId');
        expect(requestInfo.method).toEqual('PATCH');
        expect(requestInfo.body).toBeTruthy();
        let body = JSON.parse(requestInfo.body as string);
        expect(body.Operations.length).toEqual(1);
        assertAuthWasPassed(requestInfo);
        return body;
    }

    test('can remove all group members', async () => {
        fetcher.queueUpNextResponse({});

        await repo.removeGroupMembers('groupId');
        let body = assertPatchWasMadeToGroupAndReturnBody();
        expect(body.Operations[0].op).toEqual('remove');
        expect(body.Operations[0].path).toEqual('members');
    });
});
