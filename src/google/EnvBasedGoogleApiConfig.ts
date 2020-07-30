import process from 'process';
import {IGoogleApiConfig} from "./IGoogleApiConfig";
export class EnvBasedGoogleApiConfig implements IGoogleApiConfig {
    authenticationSubject: string = process.env.GOOGLE_AUTHENTICATION_SUBJECT;
    base64EncodedKeyFile: string = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64_KEY_FILE;
    googleAppOrganisationId: string = process.env.GOOGLE_APP_ORGANISATION_ID;
}
