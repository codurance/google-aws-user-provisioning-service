import {IAwsUserRepository} from "./aws/IAwsUserRepository";
import {IGoogleUserSource} from "./google/IGoogleUserSource";

export class UserMapper {
    constructor(private awsUserRepo: IAwsUserRepository,
                private googleUserRepo: IGoogleUserSource) {
    }


    public async mapUsersFromGoogleToAws(): Promise<void> {

    }

}
