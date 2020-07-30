import {IGoogleApiConfig} from "./IGoogleApiConfig";

const {google} = require('googleapis');

export function getGoogleAuth(googleApiConfig: IGoogleApiConfig) {
    const auth = new google.auth.JWT({
        scopes: [
            'https://www.googleapis.com/auth/admin.directory.user.readonly',
            'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
            'https://www.googleapis.com/auth/admin.directory.group.readonly',
        ],
        subject: googleApiConfig.authenticationSubject,
    });
    let configJson = Buffer.from(googleApiConfig.base64EncodedKeyFile, 'base64').toString();
    auth.fromJSON(JSON.parse(configJson));
    return auth;
}
