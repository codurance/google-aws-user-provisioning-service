import {FetchRequest, FetchResponse, IFetcher} from "./IFetcher";
const fetch = require('node-fetch');

export class Fetcher implements IFetcher {
    async fetch(request: FetchRequest): Promise<FetchResponse> {
        let result = await fetch(request.url, {
            body: request.body,
            method: request.method,
            headers: request.headers
        });
        let resultBody = await result.text();
        return {
            body: resultBody,
            code: result.status
        }
    }
}
