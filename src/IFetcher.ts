const fetch = require('node-fetch');
export interface IFetcher {
    fetch(request: FetchRequest): Promise<FetchResponse>;
}

export interface FetchResponse {
    code: number;
    body: string;
}

export interface FetchRequest {
    url: string,
    method: string;
    headers: Record<string, string>;
    body?: string;
}

export class Fetcher implements IFetcher {
    async fetch(request: FetchRequest): Promise<FetchResponse> {
        let result = await fetch(request.url, {
            body: request.body,
            method: request.method,
            headers: request.headers
        });
        return {
            body: result.text(),
            code: result.code
        }
    }
}
