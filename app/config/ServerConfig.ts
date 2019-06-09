import {injectable} from "inversify";
import {OverridableConfig} from "../core/OverridableConfig";

const DEFAULT_ENV: string = "production";
const DEFAULT_URL: string = "localhost";
const DEFAULT_PORT: number = 1433;
const DEFAULT_NAME: string = "Events api";

@injectable()
export class ServerConfig extends OverridableConfig {
    public readonly name: string = DEFAULT_NAME;
    public readonly url: string = DEFAULT_URL;
    public readonly port: number = DEFAULT_PORT;
    public readonly env: string = (process.env.NODE_ENV || DEFAULT_ENV).trim();
}

export const serverConfig = new ServerConfig().override();
