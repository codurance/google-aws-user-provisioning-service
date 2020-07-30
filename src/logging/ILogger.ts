export interface ILogger {
    logInfo(message: string): Promise<void>;
}
