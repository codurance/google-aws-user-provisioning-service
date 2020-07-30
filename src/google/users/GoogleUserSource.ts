import {IGoogleUserSource} from "./IGoogleUserSource";
import {IGoogleUser} from "./IGoogleUser";
import {IGoogleApiConfig} from "../IGoogleApiConfig"
import {getGoogleDirectoryService} from "../GetGoogleDirectoryService";

export class GoogleUserSource implements IGoogleUserSource {
    constructor(private googleApiConfig: IGoogleApiConfig) {
    }

    public async getUsers(): Promise<IGoogleUser[]> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let usersResult = await service.users.list(this.getCustomerParam());
        const users: IGoogleUser[] = usersResult.data.users.map((u: any) => ({
            primaryEmail: u.primaryEmail,
            fullName: u.name.fullName,
            firstName: u.name.firstName,
            lastName: u.name.lastName,
            id: u.id,
        } as IGoogleUser));
        return users;
    }

    private getCustomerParam(): { customer: string } {
        return {
            customer: this.googleApiConfig.googleAppOrganisationId
        };
    }

    async getGroups(): Promise<any> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let groupResult = await service.groups.list(this.getCustomerParam());
        return groupResult.data.groups.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description
        }));
    }

    async getGroupMemberships(groupId: string): Promise<any> {
        const service = getGoogleDirectoryService(this.googleApiConfig);
        let memberResult = await service.members.list({
            groupKey: groupId
        });
        let members = memberResult.data.members || [];
        return members.map((m: any) => ({
            id: m.id,
            email: m.id
        }));
    }
}

/*

{ kind: 'admin#directory#user',
    id: '110941305303189324022',
    etag:
     '"kiKSuhzmyofMmWmS5g80-1Aaw_gBYHcVm8sLPdUxsUQ/dtf0D5CDOD3vOJSr4wO35cfp85M"',
    primaryEmail: 'paul@truertech.com',
    name:
     { givenName: 'Paul',
       familyName: 'Morris-Hill',
       fullName: 'Paul Morris-Hill' },
    isAdmin: true,
    isDelegatedAdmin: false,
    lastLoginTime: '2020-07-28T11:50:15.000Z',
    creationTime: '2014-12-28T11:36:35.000Z',
    agreedToTerms: true,
    suspended: false,
    archived: false,
    changePasswordAtNextLogin: false,
    ipWhitelisted: false,
    emails:
     [ [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object] ],
    aliases:
     [ 'support@truertech.com',
       'support@magicaltexts.com',
       'facebook@magicaltexts.com',
       'support@process-stash.com',
       'mail@process-stash.com',
       'production-aws@truertech.com' ],
    nonEditableAliases:
     [ 'paul@santasmobile.org',
       'paul@truertech.com.test-google-a.com',
       'support@santasmobile.org',
       'support@truertech.com.test-google-a.com',
       'paul@clockit.co.uk',
       'support@clockit.co.uk',
       'production-aws@clockit.co.uk',
       'production-aws@santasmobile.org',
       'production-aws@truertech.com.test-google-a.com' ],
    customerId: 'C03l8erv8',
    orgUnitPath: '/',
    isMailboxSetup: true,
    isEnrolledIn2Sv: false,
    isEnforcedIn2Sv: false,
    includeInGlobalAddressList: true,
    recoveryEmail: 'paulmorrishill@googlemail.com' } ]
 */
