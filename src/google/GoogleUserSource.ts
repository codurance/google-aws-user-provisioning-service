const {google} = require('googleapis');
import {IGoogleUserSource} from "./IGoogleUserSource";
import {IGoogleUser} from "./IGoogleUser";
import {IGoogleApiConfig} from "./IGoogleApiConfig"

export class GoogleUserSource implements IGoogleUserSource {
    constructor(private googleApiConfig: IGoogleApiConfig) {
    }

    async getUsers(): Promise<IGoogleUser[]> {
        const service = this.getGoogleDirectoryService();
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
        const service = this.getGoogleDirectoryService();
        let groupResult = await service.groups.list(this.getCustomerParam());
        return groupResult.data.groups.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description
        }));
    }

    async getGroupMemberships(groupId: string): Promise<any> {
        const service = this.getGoogleDirectoryService();
        let memberResult = await service.members.list({
            groupKey: groupId
        });
        let members = memberResult.data.members || [];
        return members.map((m: any) => ({
            id: m.id,
            email: m.id
        }));
    }

    private getGoogleDirectoryService() {
        const auth = this.getGoogleAuth();
        const service = google.admin({version: 'directory_v1', auth: auth});
        return service;
    }

    private getGoogleAuth() {
        const auth = new google.auth.JWT({
            keyFile: 'credentials.json',
            scopes: [
                'https://www.googleapis.com/auth/admin.directory.user.readonly',
                'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
                'https://www.googleapis.com/auth/admin.directory.group.readonly',
            ],
            subject: this.googleApiConfig.authenticationSubject,
        });
        let configJson = Buffer.from(this.googleApiConfig.base64EncodedKeyFile, 'base64').toString();
        auth.fromJSON(JSON.parse(configJson));
        return auth;
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
