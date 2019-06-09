import {OverridableConfig} from "../core/OverridableConfig";
import {injectable} from "inversify";

@injectable()
export class DatabaseConfig extends OverridableConfig {

    public readonly dialect: string = "postgres";
    public readonly host: string = "localhost";
    public readonly port: number = 5432;
    public readonly database: string = "";
    public readonly username: string = "";
    public readonly password: string = "";
    public readonly pool: { max: number, min: number, idle: number, acquire: number } = {
        max: 20,
        min: 1,
        idle: 10000,
        acquire: 60000,
    };
    public readonly resetMigrations: boolean = false;
    public readonly logMigrations: boolean = false;
}
