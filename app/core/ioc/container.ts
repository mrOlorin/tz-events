import {Container, interfaces} from "inversify";
import {OverridableConfig} from "../OverridableConfig";
import {TYPES} from "./types";
import {AuthConfig} from "../../config/AuthConfig";
import UserService from "../../services/UserService";
import {DatabaseConfig} from "../../config/DatabaseConfig";
import {ServerConfig} from "../../config/ServerConfig";
import {DatabaseService} from "../../services/DatabaseService";
import {Logger} from "../Logger";
import FakeService from "../../services/FakeService";
import "../../controllers";
import AuthService from "../../services/AuthService";
import * as winston from "winston";
import ValidationService from "../../services/ValidationService";
import EventService from "../../services/EventService";
import AuthMiddleware from "../../middleware/AuthMiddleware";

export const overrideConfig = <T extends OverridableConfig>(context: interfaces.Context, injectable: T) => {
    injectable.override();
    return injectable;
};

const iocContainer: Container = new Container();

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ]
});
iocContainer.bind<Logger>(TYPES.Logger).toConstantValue(logger);
iocContainer.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);

// Configs
iocContainer.bind<ServerConfig>(TYPES.ServerConfig).to(ServerConfig).inSingletonScope().onActivation(overrideConfig);
iocContainer.bind<DatabaseConfig>(TYPES.DatabaseConfig).to(DatabaseConfig).inSingletonScope().onActivation(overrideConfig);
iocContainer.bind<AuthConfig>(TYPES.AuthConfig).to(AuthConfig).inSingletonScope().onActivation(overrideConfig);

// Services
iocContainer.bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
iocContainer.bind<ValidationService>(TYPES.ValidationService).to(ValidationService).inSingletonScope();
iocContainer.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
iocContainer.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
iocContainer.bind<EventService>(TYPES.EventService).to(EventService).inSingletonScope();
iocContainer.bind<FakeService>(TYPES.FakeService).to(FakeService).inSingletonScope();

export default iocContainer;
