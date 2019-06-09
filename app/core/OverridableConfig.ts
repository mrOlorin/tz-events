import * as fs from "fs";
import * as path from "path";
import {injectable} from "inversify";
import {Logger} from "./Logger";
import {APIError} from "./APIError";
import {ErrorList} from "../ErrorList";

@injectable()
export abstract class OverridableConfig {

    [key: string]: any;
    public readonly env: string = process.env.NODE_ENV || "production";
    protected logger?: Logger;

    public override() {
        const section: string = this.constructor.name;
        const extendedConfig = this.loadExtendedConfig(process.env.CONFIG);
        if (extendedConfig[section]) {
            let item: any;
            for (item in extendedConfig[section]) {
                if (!extendedConfig[section].hasOwnProperty(item)) {
                    continue;
                }
                this[item] = extendedConfig[section][item];
            }
        }
        this.overrideFromNodeEnv();
        return this;
    }

    private overrideFromNodeEnv() {
        const section: string = this.constructor.name;
        for (const key of Object.keys(this)) {
            const envValue = process.env[section + "_" + key] ||
            process.env[section.toUpperCase() + "_" + key.toUpperCase()];
            if (envValue) {
                this[key] = envValue;
            }
        }
    }

    private loadExtendedConfig(extendedConfigPath: string = "./config.json"): any {
        extendedConfigPath = path.resolve(extendedConfigPath);
        if (!extendedConfigPath || !fs.existsSync(extendedConfigPath)) {
            if (this.logger) {
                this.logger.info(`Extended config file "${extendedConfigPath}" does not exists.`);
            }
            return {};
        }
        let configFile: any;
        try {
            configFile = fs.statSync(extendedConfigPath);
        } catch (e) {
            throw new APIError(
                ErrorList.ConfigError,
                `Could not read extended config file from "${extendedConfigPath}"`,
            );
        }
        if (!configFile) {
            if (this.logger) {
                this.logger.warn(`Couldn't read extended config file "${extendedConfigPath}"`);
            }
            return {};
        }
        try {
            const extendedConfig = JSON.parse(fs.readFileSync(extendedConfigPath, "utf8"));
            if (!extendedConfig[this.env]) {
                if (this.logger) {
                    this.logger.warn(`Couldn't load extended config's section "${this.env}" ` +
                        `from "${extendedConfigPath}"`);
                }
                return {};
            }
            return extendedConfig[this.env];
        } catch (e) {
            if (this.logger) {
                this.logger.error(`Could not parse extended config file "${extendedConfigPath}"`);
            }
            throw new APIError(ErrorList.ConfigError, {meta: e});
        }
    }

}
