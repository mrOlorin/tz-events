import * as express from "express";
import {BaseMiddleware} from "inversify-express-utils";
import {injectable} from "inversify";
import {ErrorList} from "../ErrorList";

@injectable()
export default class AuthMiddleware extends BaseMiddleware {

    public async handler(req: express.Request,
                         res: express.Response,
                         next: express.NextFunction) {
        if (!await this.httpContext.user.isAuthenticated()) {
            next(ErrorList.AccessDenied);
        } else {
            next();
        }
    }

}
