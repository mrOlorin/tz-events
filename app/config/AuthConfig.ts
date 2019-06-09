import { OverridableConfig } from "../core/OverridableConfig";
import { injectable } from "inversify";

@injectable()
export class AuthConfig extends OverridableConfig {

    public readonly authSecret: string = "authSecret";
    public readonly authTokenLifeTimeSeconds: number = 60 * 60 * 24;

}
