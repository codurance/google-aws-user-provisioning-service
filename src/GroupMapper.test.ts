import {GroupMapper} from "./GroupMapper";
import {LoggerSpy} from "./test-util/LoggerSpy";
import {InMemoryAwsGroupRepo} from "./test-util/InMemoryAwsGroupRepo";
import {InMemoryGoogleGroupsSource} from "./test-util/InMemoryGoogleGroupsSource";

describe('Group mapper', () => {
    let awsGroupRepo: InMemoryAwsGroupRepo;
    let googleGroupRepo: InMemoryGoogleGroupsSource;
    let logger: LoggerSpy;
    let groupMapper: GroupMapper;

    beforeEach(() => {
        awsGroupRepo = new InMemoryAwsGroupRepo();
        googleGroupRepo = new InMemoryGoogleGroupsSource();
        logger = new LoggerSpy();
        groupMapper = new GroupMapper(awsGroupRepo, googleGroupRepo, logger);
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
        expect(awsGroupRepo.allGroups[0].description).toEqual('AWS devs');

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
            description: 'AWS devs',
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
            description: 'AWS devs',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();

        expect(awsGroupRepo.allGroups.length).toEqual(2);
    });

    test('given the group does not exist in google but does exist in AWS it deletes the group', async () => {
        awsGroupRepo.allGroups = [{
            id: 'g1',
            displayName: 'AWSDevelopers',
            description: 'AWS devs',
            members: []
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.allGroups.length).toEqual(0);
        expect(logger.loggedMessages[0]).toEqual('Group AWSDevelopers does not exist in google, deleting from AWS.')
    });

    test('given the group name does not begin with AWS it is not mapped to AWS', async () => {
        googleGroupRepo.allGroups = [{
            id: 'g1',
            name: 'Admins',
            description: 'Non AWS group'
        }];

        await groupMapper.mapGroupsFromGoogleToAws();
        expect(awsGroupRepo.allGroups.length).toEqual(0);
        expect(logger.loggedMessages[0]).toEqual('Google group Admins was ignored because it did not start with AWS.')
    });
});
