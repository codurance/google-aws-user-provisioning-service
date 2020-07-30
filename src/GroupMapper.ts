import {IAwsUserRepository} from "./aws/users/IAwsUserRepository";
import {IGoogleUserSource} from "./google/IGoogleUserSource";

export class GroupMapper {
    constructor(
        private awsRepo: IAwsUserRepository,
        private googleRepo: IGoogleUserSource
    ) {}

    public async MapGroups(): Promise<void> {

    }
}
