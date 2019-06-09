import * as express from "express";
import {injectable, inject} from "inversify";
import {interfaces} from "inversify-express-utils";
import Principal from "./Principal";
import {Request} from "express-serve-static-core";
import AuthService from "../services/AuthService";
import {TYPES} from "../core/ioc/types";
import User from "../models/User";

@injectable()
export default class AuthProvider implements interfaces.AuthProvider {

    public static readonly AUTH_HEADER: string = "authorization";

    private static fetchToken(req: Request) {
        let token: string = "";
        if (req.headers && req.headers[AuthProvider.AUTH_HEADER]) {
            const authHeader: string = req.headers[AuthProvider.AUTH_HEADER] as string;
            token = authHeader.substr(authHeader.indexOf(" ") + 1);
        } else if (req.body && req.body.token) {
            token = req.body.token;
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }
        return token;
    }

    @inject(TYPES.AuthService)
    private readonly authService: AuthService;

    public async getUser(req: express.Request,
                         res: express.Response,
                         next: express.NextFunction): Promise<interfaces.Principal> {
        const token: string = AuthProvider.fetchToken(req);
        const user: User | null = await this.authService.getUser(token);
        return new Principal(user);
    }

}
