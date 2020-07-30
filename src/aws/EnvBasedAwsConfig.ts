import {IAwsConfig} from "./IAwsConfig";
import process from 'process';
export class EnvBasedAwsConfig implements IAwsConfig {
    scimToken: string = process.env.AWS_SCIM_TOKEN;
    scimUrl: string = process.env.AWS_SCIM_URL;
}
