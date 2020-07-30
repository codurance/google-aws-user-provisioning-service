import {GroupMapper} from "./GroupMapper";
import {LoggerSpy} from "./test-util/LoggerSpy";
import {InMemoryAwsGroupRepo} from "./test-util/InMemoryAwsGroupRepo";
import {InMemoryGoogleGroupsSource} from "./test-util/InMemoryGoogleGroupsSource";
import {InMemoryAwsUserRepo} from "./test-util/InMemoryAwsUserRepo";

describe('Group mapper', () => {
    let awsGroupRepo: InMemoryAwsGroupRepo;
    let googleGroupRepo: InMemoryGoogleGroupsSource;
    let logger: LoggerSpy;
    let groupMapper: GroupMapper;
    let awsUserRepo: InMemoryAwsUserRepo;

    beforeEach(() => {
        awsGroupRepo = new InMemoryAwsGroupRepo();
        googleGroupRepo = new InMemoryGoogleGroupsSource();
        awsUserRepo = new InMemoryAwsUserRepo();
        logger = new LoggerSpy();
        groupMapper = new GroupMapper(awsGroupRepo, googleGroupRepo, awsUserRepo, logger);
    });

    test('given a group exists in google but not AWS it creates it in AWS', async () => {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSDevelopers',
            description: 'AWS devs'
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.allGroups.length).toEqual(1);
        expect(awsGroupRepo.allGroups[0].displayName).toEqual('AWSDevelopers');

        expect(logger.loggedMessages[0]).toEqual('Google group AWSDevelopers does not exist in AWS, creating.');
    });

    test('given the group exists in google and AWS it does not try to create it', async () => {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSDevelopers',
            description: 'AWS devs'
        }];

        awsGroupRepo.allGroups = [{
            id: 'a1',
            displayName: 'AWSDevelopers',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();

        expect(awsGroupRepo.allGroups.length).toEqual(1);
        expect(logger.loggedMessages[0]).toEqual('Google group AWSDevelopers already exists AWS.');
    });

    test('given a group exists in google with a different name in AWS it still creates it', async () => {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSAdmins',
            description: 'AWS admins'
        },{
            id: 'g2',
            name: 'AWSDevelopers',
            description: 'AWS devs'
        }];

        awsGroupRepo.allGroups = [{
            id: 'a1',
            displayName: 'AWSDevelopers',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();

        expect(awsGroupRepo.allGroups.length).toEqual(2);
    });

    test('given the group does not exist in google but does exist in AWS it deletes the group', async () => {
        awsGroupRepo.allGroups = [{
            id: 'g1',
            displayName: 'AWSDevelopers',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.allGroups.length).toEqual(0);
        expect(logger.loggedMessages[0]).toEqual('Group AWSDevelopers does not exist in google, deleting from AWS.')
    });

    test('given the group name does not begin with AWS it is not mapped to AWS', async () => {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'NOTAWSAdmins',
            description: 'Non AWS group'
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.allGroups.length).toEqual(0);
        expect(logger.loggedMessages[0]).toEqual('Google group NOTAWSAdmins was ignored because it did not start with AWS.')
    });

    test('given user is a member of group in google it creates a membership in AWS', async () => {
        awsUserRepo.allUsers = [{
            id: 'AWS_JOHN_ID',
            email: 'john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        }];

        googleGroupRepo.addGroupMembership('g1', {
            email: 'john@smith.com',
            id: ''
        });

        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSAdmins',
            description: ''
        }];

        awsGroupRepo.allGroups = [{
            id: 'AWS_GROUP_ID',
            displayName: 'AWSAdmins',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.newMemberships.length).toEqual(1);
        expect(awsGroupRepo.newMemberships[0].userId).toEqual('AWS_JOHN_ID');
        expect(awsGroupRepo.newMemberships[0].groupId).toEqual('AWS_GROUP_ID');
    });

    function givenThereIsAnAdminGroupInGoogle() {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSAdmins',
            description: ''
        }];
    }

    function givenThereIsAnAdminGroupInAws() {
        awsGroupRepo.allGroups = [{
            id: 'AWS_GROUP_ID',
            displayName: 'AWSAdmins',
            members: []
        }];
    }

    test('it matches the correct user when there are multiple AWS users', async () => {
        awsUserRepo.allUsers = [{
            id: 'UNRELATED',
            email: 'not_john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        },{
            id: 'AWS_JOHN_ID',
            email: 'john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        }];

        googleGroupRepo.addGroupMembership('g1', {
            email: 'john@smith.com',
            id: ''
        });

        givenThereIsAnAdminGroupInGoogle();
        givenThereIsAnAdminGroupInAws();

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.newMemberships[0].userId).toEqual('AWS_JOHN_ID');
    });

    test('it matches the correct group when there are multiple AWS users', async () => {
        awsUserRepo.allUsers = [{
            id: 'AWS_JOHN_ID',
            email: 'john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        }];

        googleGroupRepo.addGroupMembership('g1', {
            email: 'john@smith.com',
            id: ''
        });

        givenThereIsAnAdminGroupInGoogle();
        awsGroupRepo.allGroups = [{
            id: 'UNRELATED',
            displayName: 'NotAdmins',
            members: []
        },{
            id: 'AWS_GROUP_ID',
            displayName: 'AWSAdmins',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.newMemberships[0].groupId).toEqual('AWS_GROUP_ID');
    });

    test('given the group has just been created it can still add memberships', async () => {
        awsUserRepo.allUsers = [{
            id: 'AWS_JOHN_ID',
            email: 'john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        }];

        googleGroupRepo.addGroupMembership('g1', {
            email: 'john@smith.com',
            id: ''
        });

        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'AWSAdmins',
            description: ''
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.newMemberships[0].userId).toEqual('AWS_JOHN_ID');
        expect(awsGroupRepo.newMemberships[0].groupId).toEqual(awsGroupRepo.allGroups[0].id);
    });

    test('memberships to groups not starting with AWS are ignored', async () => {
        awsUserRepo.allUsers = [{
            id: 'AWS_JOHN_ID',
            email: 'john@smith.com',
            displayName: '',
            lastName: '',
            firstName: ''
        }];

        googleGroupRepo.addGroupMembership('g1', {
            email: 'john@smith.com',
            id: ''
        });

        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'Admins',
            description: ''
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.newMemberships.length).toEqual(0);
    });
});
