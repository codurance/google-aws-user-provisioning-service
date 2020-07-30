import {getGoogleAuth} from "./GetGoogleAuth";
import {google} from "googleapis";
import {IGoogleApiConfig} from "./IGoogleApiConfig";

export function getGoogleDirectoryService(googleApiConfig: IGoogleApiConfig) {
    const auth = getGoogleAuth(googleApiConfig);
    const service = google.admin({version: 'directory_v1', auth: auth});
    return service;
}
