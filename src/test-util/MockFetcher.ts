import {FetchRequest, FetchResponse, IFetcher} from "../IFetcher";

export class MockFetcher implements IFetcher {
    public nextResponse: FetchResponse;
    public requests: FetchRequest[] = [];

    async fetch(request: FetchRequest): Promise<FetchResponse> {
        this.requests.push(request);
        return this.nextResponse;
    }

    public givenTheNextResponseIs(responseObject: any) {
        this.nextResponse = {
            code: 200,
            body: JSON.stringify(responseObject)
        };
    }

    public assertOneRequestAndReturn(): FetchRequest {
        const calls = this.requests;
        expect(calls.length).toEqual(1);
        return calls[0];
    }
}
