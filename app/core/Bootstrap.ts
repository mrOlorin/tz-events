import * as bodyParser from "body-parser";
import * as cors from "cors";
import {Container} from "inversify";
import {InversifyExpressServer} from "inversify-express-utils";
import {Logger} from "./Logger";
import {TYPES} from "./ioc/types";
import {ServerConfig} from "../config/ServerConfig";
import {APIError} from "./APIError";
import {ErrorList} from "../ErrorList";
import {DatabaseService} from "../services/DatabaseService";
import AuthProvider from "../middleware/AuthProvider";

export default class Bootstrap {
    private logger: Logger;
    private container: Container;

    constructor(private serverConfig: ServerConfig, container: Container) {
        this.container = container;
        this.logger = this.container.get<Logger>(TYPES.Logger);
    }

    public async init() {
        const databaseService = this.container.get<DatabaseService>(TYPES.DatabaseService);
        await databaseService.init();

        const webServer = new InversifyExpressServer(
            this.container,
            null,
            null,
            null,
            AuthProvider,
        );
        webServer.setConfig((app) => {
            app.use(bodyParser.urlencoded({extended: true}));
            app.use(bodyParser.json());
            app.use(cors());
        });
        webServer.setErrorConfig((app) => {
            app.use((err: any, req: any, res: any, next: any) => {
                try {
                    const apiError: APIError = this.parseControllerError(err);
                    if (apiError.errors && apiError.errors.length > 0) {
                        res.status(apiError.status).send(apiError);
                    } else {
                        res.status(apiError.status).send({errors: [apiError]});
                    }
                } catch (e) {
                    this.logger.error("Invalid error", err);
                }
                next();
            });
        });
        webServer.build().listen(this.serverConfig.port);
        this.logger.info(`Server "${this.serverConfig.name}" running at port ${this.serverConfig.port}`);
    }

    private parseControllerError(err: any): APIError {
        let apiError: APIError;
        if (this.isApiError(err)) {
            apiError = err as APIError;
        } else {
            this.logger.error("Unhandled error thrown from controller", err);
            apiError = ErrorList.InternalServerError;
        }
        return apiError;
    }

    private isApiError(err: any): boolean {
        if (Array.isArray(err)) {
            return this.isApiError(err[0]);
        } else if ("object" === typeof err && err.errors) {
            return this.isApiError(err.errors);
        }
        return !!err && !!err.status && !!err.code && !!err.title;
    }

}
