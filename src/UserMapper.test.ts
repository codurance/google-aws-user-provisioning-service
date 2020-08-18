import {UserMapper} from "./UserMapper";
import {InMemoryGoogleUserSource} from "./test-util/InMemoryGoogleUserSource";
import {InMemoryAwsUserRepo} from "./test-util/InMemoryAwsUserRepo";
import {IAwsUser} from "./aws/users/IAwsUser";
import {IGoogleUser} from "./google/users/IGoogleUser";
import {LoggerSpy} from "./test-util/LoggerSpy";

describe('UserMapper', async() => {
    let awsUserRepo: InMemoryAwsUserRepo;
    let googleUserSource: InMemoryGoogleUserSource;
    let userMapper: UserMapper;
    let logger: LoggerSpy;

    beforeEach(()=> {
        awsUserRepo = new InMemoryAwsUserRepo();
        googleUserSource = new InMemoryGoogleUserSource();
        logger = new LoggerSpy();
        userMapper = new UserMapper(awsUserRepo, googleUserSource, logger);
    });

    test('given a user exist in google but not in AWS it creates the user', async () => {
        googleUserSource.allUsers = [{
            id: 'GID1',
            primaryEmail: 'john@smith.com',
            firstName: 'john',
            lastName: 'smith',
            fullName: 'johnny smith'
        }];
        await userMapper.mapUsersFromGoogleToAws();

        expect(awsUserRepo.allUsers.length).toBe(1);
        expect(awsUserRepo.allUsers[0].firstName).toBe('john');
        expect(awsUserRepo.allUsers[0].lastName).toBe('smith');
        expect(awsUserRepo.allUsers[0].displayName).toBe('johnny smith');
        expect(awsUserRepo.allUsers[0].email).toBe('john@smith.com');

        expect(logger.loggedMessages[0]).toEqual('Creating user johnny smith in AWS');
    });

    test('given multiple users exist in google but not in AWS it creates the users',async () => {
        googleUserSource.allUsers = [
            googleUser('john@smith.com'),
            googleUser('jane@doe.com')
        ];
        await userMapper.mapUsersFromGoogleToAws();

        expect(awsUserRepo.allUsers.length).toBe(2);
        expect(awsUserRepo.allUsers[0].email).toBe('john@smith.com');
        expect(awsUserRepo.allUsers[1].email).toBe('jane@doe.com');
    });

    test('given a user already exists in AWS it but the email does not match it still adds', async () => {
        googleUserSource.allUsers = [
            googleUser('jane@doe.com'),
            googleUser('john@smith.com')];
        awsUserRepo.allUsers = [awsUser('jane@doe.com')];

        await userMapper.mapUsersFromGoogleToAws();

        expect(awsUserRepo.allUsers.length).toBe(2);
        expect(awsUserRepo.allUsers[0].email).toBe('jane@doe.com');
        expect(awsUserRepo.allUsers[1].email).toBe('john@smith.com');
    });

    test('given a user exists in AWS but not in google it deletes the user', async () => {
        awsUserRepo.allUsers = [awsUser('jane@doe.com', 'Jane')];

        await userMapper.mapUsersFromGoogleToAws();

        expect(logger.loggedMessages[0]).toEqual('Deleting existing user jane@doe.com.');
        expect(awsUserRepo.allUsers.length).toBe(0);
    });

    test('given more than 50 users exists in AWS but not in google it deletes all the users', async () => {
        awsUserRepo.allUsers = [];
        for(let i = 0; i < 232; i++) {
            awsUserRepo.allUsers.push(awsUser('jane@doe.com' + i, 'Jane' + i));
        }

        await userMapper.mapUsersFromGoogleToAws();

        expect(logger.loggedMessages[0]).toEqual('Deleting existing user jane@doe.com0.');
        expect(logger.loggedMessages[231]).toEqual('Deleting existing user jane@doe.com231.');
        expect(awsUserRepo.allUsers.length).toBe(0);
    });

    function awsUser(email: string, displayName = ''): IAwsUser {
        return {
            id: Math.random().toString(),
            email: email,
            displayName: displayName,
            lastName: '',
            firstName: ''
        };
    }

    function googleUser(primaryEmail: string, fullName: string = ''): IGoogleUser {
        return {
            id: Math.random().toString(),
            primaryEmail: primaryEmail,
            firstName: '',
            lastName: '',
            fullName: fullName
        };
    }
});

