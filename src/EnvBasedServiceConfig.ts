import {IAwsConfig} from "./aws/IAwsConfig";
import process from 'process';
import {IGoogleApiConfig} from "./google/IGoogleApiConfig";
export class EnvBasedServiceConfig implements IAwsConfig, IGoogleApiConfig {
    scimToken: string = process.env.AWS_SCIM_TOKEN as string;
    scimUrl: string = process.env.AWS_SCIM_URL as string;
    authenticationSubject: string = process.env.GOOGLE_AUTHENTICATION_SUBJECT as string;
    base64EncodedKeyFile: string = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64_KEY_FILE as string;
    googleAppOrganisationId: string = process.env.GOOGLE_APP_ORGANISATION_ID as string;
}
