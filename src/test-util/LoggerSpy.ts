import {ILogger} from "../logging/ILogger";

export class LoggerSpy implements ILogger {
    public loggedMessages: string[] = [];
    logInfo(message: string): Promise<void> {
        this.loggedMessages.push(message);
    }
}
