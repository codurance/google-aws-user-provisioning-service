import {FetchRequest} from "../../IFetcher";

export function assertAuthWasPassed(requestInfo: FetchRequest) {
    const contentTypeHeader = requestInfo.headers['Content-Type'];
    const authenticationHeader = requestInfo.headers['Authorization'];
    expect(contentTypeHeader).toBe('application/scim+json');
    expect(authenticationHeader).toBe('Bearer SCIM_TOKEN');
}
