import {ILogger} from "./ILogger";

export class ConsoleLogger implements ILogger {
    async logInfo(message: string): Promise<void> {
        console.log(message);
    }

}
