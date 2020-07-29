const google = require('googleapis');
import {IGoogleUserSource} from "./IGoogleUserSource";
import {IGoogleUser} from "./IGoogleUser";

class GoogleUserSource implements IGoogleUserSource {
    async getUsers(): Promise<IGoogleUser> {
        const auth = new google.auth.JWT({
            keyFile: 'credentials.json',
            scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
            subject: "paul@truertech.com",
        });

        const service = google.admin({version: 'directory_v1', auth: auth});
        let usersResult = await service.users.list({
            customer: 'C03l8erv8'
        });
        return usersResult.data.users.map((u: any) => ({
            primaryEmail: u.primaryEmail,
            name: u.name.fullName,
            id: u.id,
            groupMemberships: []
        } as IGoogleUser));
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
