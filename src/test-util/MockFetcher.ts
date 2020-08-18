import {FetchRequest, FetchResponse, IFetcher} from "../IFetcher";
import assert from "assert";

export class MockFetcher implements IFetcher {
    public nextResponses: FetchResponse[] = [];
    public requests: FetchRequest[] = [];

    async fetch(request: FetchRequest): Promise<FetchResponse> {
        this.requests.push(request);
        let nextResponse = this.nextResponses.shift();
        assert(nextResponse);
        return nextResponse;
    }

    public queueUpNextResponse(responseObject: any) {
        this.nextResponses.push({
            code: 200,
            body: JSON.stringify(responseObject)
        });
    }

    public assertOneRequestAndReturn(): FetchRequest {
        const calls = this.requests;
        expect(calls.length).toEqual(1);
        return calls[0];
    }
}
