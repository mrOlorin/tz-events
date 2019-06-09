import * as jwt from "jsonwebtoken";
import {AuthConfig} from "../config/AuthConfig";
import {inject, injectable} from "inversify";
import {AuthResult} from "./AuthService/AuthResult";
import {AuthPayload} from "./AuthService/AuthPayload";
import {TYPES} from "../core/ioc/types";
import UserService from "./UserService";
import User from "../models/User";
import {Logger} from "../core/Logger";
import {ErrorList} from "../ErrorList";
import ValidationService from "./ValidationService";

@injectable()
export default class AuthService {

    @inject(TYPES.AuthConfig) private config: AuthConfig;
    @inject(TYPES.UserService) private userService: UserService;
    @inject(TYPES.Logger) private logger: Logger;
    @inject(TYPES.ValidationService) protected validationService: ValidationService;

    public async authenticate(email: string, plainTextPassword: string): Promise<AuthResult> {
        this.validationService.validate({email, plainTextPassword}, {
            email: {type: "email"},
            plainTextPassword: {type: "string"},
            $$strict: true,
        });
        email = email.toLowerCase();
        const user: User | null = await User.findOne({where: {email}});
        if (!user || !user.password) {
            throw ErrorList.UserNotFound;
        }
        const passwordIsValid: boolean = await this.userService.validatePassword(plainTextPassword, user.password);
        if (!passwordIsValid) {
            throw ErrorList.UserNotFound;
        }
        delete user.password;
        return {
            user,
            token: await this.generateAuthToken({id: user.id}),
            expiresIn: this.config.authTokenLifeTimeSeconds,
        };
    }

    public async getUser(token: string): Promise<User | null> {
        if (!token) {
            return null;
        }
        try {
            const authPayload: AuthPayload = await this.verifyAuthToken(token);
            if (!authPayload) {
                return null;
            }
            const user: User | null = await this.userService.findOne({where: {id: authPayload.userId}});
            if (null === user) {
                return null;
            }
            delete user.password;
            return user;
        } catch (e) {
            return null;
        }
    }

    public async generateAuthToken(user: Partial<User>): Promise<string> {
        const authPayload: AuthPayload = {
            userId: "" + user.id,
        };
        return jwt.sign(authPayload, this.config.authSecret, {
            expiresIn: this.config.authTokenLifeTimeSeconds,
        });
    }

    public async verifyAuthToken(token: string): Promise<AuthPayload> {
        return new Promise<AuthPayload>((resolve, reject) => {
            jwt.verify(token, this.config.authSecret, (err: any, payload: AuthPayload) => {
                if (err) {
                    reject(ErrorList.AuthTokenInvalid);
                } else {
                    resolve(payload);
                }
            });
        });
    }

}
