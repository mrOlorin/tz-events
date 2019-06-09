import {injectable} from "inversify";

export interface LogMethod {
    (message: string, meta?: any): void;
}
@injectable()
export class Logger {

    public log: LogMethod;
    public silly: LogMethod;
    public debug: LogMethod;
    public verbose: LogMethod;
    public info: LogMethod;
    public warn: LogMethod;
    public error: LogMethod;

    constructor() {
        this.log = console.log;
        this.silly = console.log;
        this.debug = console.debug;
        this.verbose = console.log;
        this.info = console.info;
        this.warn = console.warn;
        this.error = console.error;
    }

}
