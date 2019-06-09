import * as bcrypt from "bcryptjs";
import {inject, injectable} from "inversify";
import {ICountOptions} from "sequelize-typescript/lib/interfaces/ICountOptions";
import {DatabaseService} from "./DatabaseService";
import {ErrorList} from "../ErrorList";
import {APIError} from "../core/APIError";
import {TYPES} from "../core/ioc/types";
import {Logger} from "../core/Logger";
import User from "../models/User";
import {IFindOptions} from "sequelize-typescript";
import {Transaction} from "sequelize";
import ValidationService from "./ValidationService";

@injectable()
export default class UserService {

    @inject(TYPES.Logger) protected logger: Logger;
    @inject(TYPES.DatabaseService) protected databaseService: DatabaseService;
    @inject(TYPES.ValidationService) protected validationService: ValidationService;

    public async create(userData: Partial<User>): Promise<User> {
        return await this.databaseService.inTransaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        }, async (transaction) => {

            this.validationService.validate(userData, {
                email: {type: "email"},
                password: {type: "string", min: 6, max: 255},
                $$strict: true,
            });
            userData.password = await this.encryptPassword(userData.password as string);
            userData.email = (userData.email as string).toLowerCase();

            if (await User.find({where: {email: userData.email}, transaction})) {
                throw ErrorList.UserAlreadyExists;
            }

            return await User.create(userData, {transaction, returning: true});
        });
    }

    public async findOne(options?: IFindOptions<User>): Promise<User | null> {
        return await User.findOne(options);
    }

    public async encryptPassword(plainTextPassword: string, saltOrRounds: string | number = 10): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            bcrypt.hash(plainTextPassword, saltOrRounds, (err: Error, hash: string) => {
                if (err) {
                    reject(new APIError(ErrorList.PasswordHashError, {meta: err}));
                    return;
                }
                resolve(hash);
            });
        });
    }

    public async validatePassword(plainTextPassword: string, passwordHash: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            bcrypt.compare(plainTextPassword, passwordHash, (err: Error, same: boolean) => {
                if (err) {
                    reject(new APIError(ErrorList.PasswordCompareError, {meta: err}));
                    return;
                }
                resolve(same);
            });
        });
    }

    public async exists(options?: ICountOptions<User>): Promise<boolean> {
        return await User.count(options) > 0;
    }

}
