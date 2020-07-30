import {IAwsUserRepository} from "./aws/users/IAwsUserRepository";
import {IGoogleUserSource} from "./google/IGoogleUserSource";
import {ILogger} from "./logging/ILogger";

export class UserMapper {
    constructor(private awsUserRepo: IAwsUserRepository,
                private googleUserRepo: IGoogleUserSource,
                private logger: ILogger) {
    }

    public async mapUsersFromGoogleToAws(): Promise<void> {
        const googleUsers = await this.googleUserRepo.getUsers();
        const allAwsUsers = await this.awsUserRepo.getAllUsers();
        for(let user of googleUsers) {
            if(allAwsUsers.find(u => u.email === user.primaryEmail)){
                await this.logger.logInfo(`Skipping ${user.fullName} because the AWS user already exists.`);
                continue;
            }

            await this.logger.logInfo(`Creating user ${user.fullName} in AWS`);
            await this.awsUserRepo.createUser(
                user.firstName,
                user.lastName,
                user.fullName,
                user.primaryEmail
            );
        }

        for (let awsUser of allAwsUsers) {
            let matchingGoogleUser = googleUsers.find(u => u.primaryEmail === awsUser.email);
            if(matchingGoogleUser)
                continue;
            await this.logger.logInfo(`The AWS user ${awsUser.displayName} does not exist google, deleting.`)
            await this.awsUserRepo.deleteUser(awsUser.id);
        }
    }
}
