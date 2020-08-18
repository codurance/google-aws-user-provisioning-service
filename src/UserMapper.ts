import {IAwsUserRepository} from "./aws/users/IAwsUserRepository";
import {IGoogleUserSource} from "./google/users/IGoogleUserSource";
import {ILogger} from "./logging/ILogger";
import {IAwsUser} from "./aws/users/IAwsUser";

export class UserMapper {
    constructor(private awsUserRepo: IAwsUserRepository,
                private googleUserRepo: IGoogleUserSource,
                private logger: ILogger) {
    }

    public async mapUsersFromGoogleToAws(): Promise<void> {
        const googleUsers = await this.googleUserRepo.getUsers();
        let random50AwsUsers: IAwsUser[];
        do {
            random50AwsUsers = await this.awsUserRepo.get50RandomUsers();

            for(let user of random50AwsUsers){
                await this.logger.logInfo(`Deleting existing user ${user.email}.`);
                await this.awsUserRepo.deleteUser(user.id);
            }
        } while(random50AwsUsers.length > 0);

        for(let user of googleUsers) {
            await this.logger.logInfo(`Creating user ${user.fullName} in AWS`);
            await this.awsUserRepo.createUser(
                user.firstName,
                user.lastName,
                user.fullName,
                user.primaryEmail
            );
        }
    }
}
