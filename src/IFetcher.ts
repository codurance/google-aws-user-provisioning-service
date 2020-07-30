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

