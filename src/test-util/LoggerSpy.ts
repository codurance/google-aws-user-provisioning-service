import {ILogger} from "../logging/ILogger";

export class LoggerSpy implements ILogger {
    public loggedMessages: string[] = [];
    async logInfo(message: string): Promise<void> {
        let promiseToReturnAsyncToProveMethodIsAwaitedInTests = new Promise(resolve => {
            setTimeout(() => {
                this.loggedMessages.push(message);
                resolve();
            });
        });
        await promiseToReturnAsyncToProveMethodIsAwaitedInTests;
        return;
    }
}
