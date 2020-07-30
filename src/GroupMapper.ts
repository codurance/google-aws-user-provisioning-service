import {IAwsUserRepository} from "./aws/users/IAwsUserRepository";
import {IGoogleUserSource} from "./google/users/IGoogleUserSource";
import {ILogger} from "./logging/ILogger";
import {IAwsGroupRepository} from "./aws/groups/IAwsGroupRepository";
import {IGoogleGroupSource} from "./google/groups/IGoogleGroupSource";

export class GroupMapper {
    constructor(
        private awsRepo: IAwsGroupRepository,
        private googleRepo: IGoogleGroupSource,
        private logger: ILogger
    ) {}

    public async mapGroupsFromGoogleToAws(): Promise<void> {
        let googleGroups = await this.googleRepo.getGroups();
        let awsGroups = await this.awsRepo.getAllGroups();

        for (let googleGroup of googleGroups) {
            if(!googleGroup.name.startsWith('AWS')){
                await this.logger.logInfo(`Google group ${googleGroup.name} was ignored because it did not start with AWS.`);
                continue;
            }
            let existingAwsGroupWithSameName = awsGroups.find(g => g.displayName == googleGroup.name);
            if(existingAwsGroupWithSameName){
                await this.logger.logInfo(`Google group ${googleGroup.name} already exists AWS.`);
                continue;
            }

            await this.logger.logInfo(`Google group ${googleGroup.name} does not exist in AWS, creating.`)
            await this.awsRepo.createGroup(googleGroup.name, googleGroup.description);
        }

        for (let awsGroup of awsGroups) {
            let matchingGoogleGroup = googleGroups.find(g => g.name === awsGroup.displayName);
            if(matchingGoogleGroup)
                continue;
            await this.logger.logInfo(`Group ${awsGroup.displayName} does not exist in google, deleting from AWS.`);
            await this.awsRepo.deleteGroup(awsGroup.id);
        }
    }
}
