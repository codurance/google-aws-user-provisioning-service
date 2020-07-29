import {IAwsUserRepository} from "./aws/IAwsUserRepository";
import {IGoogleUserSource} from "./google/IGoogleUserSource";

export class UserMapper {
    constructor(private awsUserRepo: IAwsUserRepository,
                private googleUserRepo: IGoogleUserSource) {
    }

    public async mapUsersFromGoogleToAws(): Promise<void> {
        const googleUsers = await this.googleUserRepo.getUsers();
        const allAwsUsers = await this.awsUserRepo.getAllUsers();
        for(let user of googleUsers) {
            if(allAwsUsers.find(u => u.email === user.primaryEmail))
                continue;
            await this.awsUserRepo.createUser(
                user.firstName,
                user.lastName,
                user.fullName,
                user.primaryEmail
            );
        }
    }
}
