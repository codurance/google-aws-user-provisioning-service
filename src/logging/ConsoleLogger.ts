import {ILogger} from "./ILogger";

export class ConsoleLogger implements ILogger {
    logInfo(message: string): Promise<void> {
        console.log(message);
    }

}
