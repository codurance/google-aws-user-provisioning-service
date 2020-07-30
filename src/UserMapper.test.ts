import {UserMapper} from "./UserMapper";
import {ICreateUserResult} from "./aws/ICreateUserResult";
import {IAwsUser} from "./aws/IAwsUser";
import {IGoogleUserSource} from "./google/IGoogleUserSource";
import {IGoogleUser} from "./google/IGoogleUser";
import {IAwsUserRepository} from "./aws/IAwsUserRepository";
import {IAwsGroup} from "./aws/IAwsGroup";

describe('UserMapper', async() => {
    let awsUserRepo: InMemoryAwsUserRepo;
    let googleUserSource: InMemoryGoogleUserSource;
    let userMapper: UserMapper;

    beforeEach(()=> {
        awsUserRepo = new InMemoryAwsUserRepo();
        googleUserSource = new InMemoryGoogleUserSource();
        userMapper = new UserMapper(awsUserRepo, googleUserSource);
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

    test('given the user already exists in AWS it does not try to create it again', async () => {
        googleUserSource.allUsers = [googleUser('john@smith.com')];
        awsUserRepo.allUsers = [awsUser('john@smith.com')];

        await userMapper.mapUsersFromGoogleToAws();

        expect(awsUserRepo.allUsers.length).toBe(1);
        expect(awsUserRepo.allUsers[0].email).toBe('john@smith.com');
    });

    test('given a user already exists in AWS it but the email does not match it still adds', async () => {
        googleUserSource.allUsers = [googleUser('john@smith.com')];
        awsUserRepo.allUsers = [awsUser('jane@doe.com')];

        await userMapper.mapUsersFromGoogleToAws();

        expect(awsUserRepo.allUsers.length).toBe(2);
        expect(awsUserRepo.allUsers[0].email).toBe('jane@doe.com');
        expect(awsUserRepo.allUsers[1].email).toBe('john@smith.com');
    });

    function awsUser(email: string) {
        return {
            id: '',
            email: email,
            displayName: '',
            lastName: '',
            firstName: ''
        };
    }

    function googleUser(primaryEmail: string) {
        return {
            id: '',
            primaryEmail: primaryEmail,
            firstName: '',
            lastName: '',
            fullName: ''
        };
    }
});

class InMemoryGoogleUserSource implements IGoogleUserSource {
    public allUsers: IGoogleUser[] = [];
    async getUsers(): Promise<IGoogleUser[]> {
        return this.allUsers;
    }
}

class InMemoryAwsUserRepo implements IAwsUserRepository {
    public allUsers: IAwsUser[] = [];
    public newUserId: string;

    async createUser(firstName: string, lastName: string, displayName: string, email: string): Promise<ICreateUserResult> {
        this.allUsers.push({
            firstName,
            lastName,
            displayName,
            email,
            id: this.newUserId
        });
        return {
            id: this.newUserId,
            successful: true,
        }
    }

    async getAllUsers(): Promise<IAwsUser[]> {
        return [...this.allUsers];
    }

    getAllGroups(): Promise<IAwsGroup[]> {
        return undefined;
    }

}
