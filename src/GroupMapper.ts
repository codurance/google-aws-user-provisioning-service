import {IAwsUserRepository} from "./aws/users/IAwsUserRepository";
import {IGoogleUserSource} from "./google/users/IGoogleUserSource";
import {ILogger} from "./logging/ILogger";
import {IAwsGroupRepository} from "./aws/groups/IAwsGroupRepository";
import {IGoogleGroupSource} from "./google/groups/IGoogleGroupSource";
import {IGoogleGroup} from "./google/groups/IGoogleGroup";
import {IAwsGroup} from "./aws/groups/IAwsGroup";

export class GroupMapper {
    constructor(
        private awsGroupRepo: IAwsGroupRepository,
        private googleRepo: IGoogleGroupSource,
        private awsUserRepo: IAwsUserRepository,
        private logger: ILogger
    ) {}

    public async mapGroupsFromGoogleToAws(): Promise<void> {
        let googleGroups = await this.googleRepo.getGroups();
        let awsGroups = await this.awsGroupRepo.getAllGroups();

        await this.createGroupsInAwsThatDoNotExist(googleGroups, awsGroups);
        await this.deleteGroupsThatNoLongerExistInGoogle(awsGroups, googleGroups);
        await this.createMembershipsFromGoogle(googleGroups);
    }

    private async deleteGroupsThatNoLongerExistInGoogle(awsGroups: IAwsGroup[], googleGroups: IGoogleGroup[]) {
        for (let awsGroup of awsGroups) {
            let matchingGoogleGroup = googleGroups.find(g => g.name === awsGroup.displayName);
            if (matchingGoogleGroup)
                continue;
            await this.logger.logInfo(`Group ${awsGroup.displayName} does not exist in google, deleting from AWS.`);
            await this.awsGroupRepo.deleteGroup(awsGroup.id);
        }
    }

    private async createGroupsInAwsThatDoNotExist(googleGroups: IGoogleGroup[], awsGroups: IAwsGroup[]) {
        for (let googleGroup of googleGroups) {
            if (!this.isGroupAwsGroup(googleGroup)) {
                await this.logger.logInfo(`Google group ${googleGroup.name} was ignored because it did not start with AWS.`);
                continue;
            }
            let existingAwsGroupWithSameName = awsGroups.find(g => g.displayName == googleGroup.name);
            if (existingAwsGroupWithSameName) {
                await this.logger.logInfo(`Google group ${googleGroup.name} already exists AWS.`);
                continue;
            }

            await this.logger.logInfo(`Google group ${googleGroup.name} does not exist in AWS, creating.`)
            await this.awsGroupRepo.createGroup(googleGroup.name, googleGroup.description);
        }
    }

    private isGroupAwsGroup(googleGroup: IGoogleGroup) {
        return googleGroup.name.startsWith('AWS');
    }

    private async createMembershipsFromGoogle(googleGroups: IGoogleGroup[]) {
        let awsGroups = await this.awsGroupRepo.getAllGroups();
        let allAwsUsers = await this.awsUserRepo.getAllUsers();
        let groupsForTransfer = googleGroups.filter(this.isGroupAwsGroup);
        for (let googleGroup of groupsForTransfer) {
            let members = await this.googleRepo.getGroupMemberships(googleGroup.id);
            let matchingAwsGroup = awsGroups.find(g => g.displayName === googleGroup.name);
            for (let member of members) {
                let thisMember = allAwsUsers.find(u => u.email === member.email);
                await this.awsGroupRepo.addMemberToGroup(thisMember.id, matchingAwsGroup.id);
            }
        }
    }
}
