export interface IGoogleUser {
    id: string,
    primaryEmail: string;
    groupMemberships: AWSGoogleGroup[]
}
