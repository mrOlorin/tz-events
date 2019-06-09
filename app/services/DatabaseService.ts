import {Sequelize as SequelizeTypescript} from "sequelize-typescript";
import {Transaction, TransactionOptions} from "sequelize";
import * as Umzug from "umzug";
import {inject, injectable} from "inversify";
import * as path from "path";
import {Migration} from "umzug";
import {DatabaseConfig} from "../config/DatabaseConfig";
import {TYPES} from "../core/ioc/types";
import {Logger} from "../core/Logger";
import {ErrorList} from "../ErrorList";

@injectable()
export class DatabaseService {

    private sequelizeTypescript: SequelizeTypescript;
    private migrationsDir: string = path.join(__dirname, "..", "..", "_migrations");

    @inject(TYPES.DatabaseConfig)
    private databaseConfig: DatabaseConfig;

    @inject(TYPES.Logger)
    private logger: Logger;
    private initPromise: Promise<void> | boolean;

    public async init(): Promise<void> {
        if (this.initPromise) {
            await this.initPromise;
            return;
        }
        this.initPromise = new Promise<void>(async (resolve, reject) => {
            try {
                this.sequelizeTypescript = new SequelizeTypescript({
                    dialect: this.databaseConfig.dialect,
                    database: this.databaseConfig.database,
                    username: this.databaseConfig.username,
                    password: this.databaseConfig.password,
                    host: this.databaseConfig.host,
                    port: this.databaseConfig.port,
                    modelPaths: [path.resolve(__dirname, "..", "models")],
                    benchmark: false,
                    logging: false,
                    pool: this.databaseConfig.pool,
                });
                await this.sequelizeTypescript.authenticate();
            } catch (e) {
                this.logger.error("Database service error", e);
                reject(e);
            }
            this.logger.info(`Connected to database "${this.databaseConfig.database}"`);
            try {
                await this.migrate(this.databaseConfig.resetMigrations);
            } catch (e) {
                this.logger.error(`Migrations error on database "${this.databaseConfig.database}"`, e);
                this.logger.error(e);
                reject(e);
            }

            this.initPromise = true;
            resolve();
        });
        await this.initPromise;
    }

    // TODO: Update sequelize typings and get rid of "any"
    public async inTransaction<T>(transactionOptions: TransactionOptions,
                                  task: (transaction: any) => Promise<T>,
                                  transactionFailLimit: number = 5): Promise<T> {
        let transactionFailCount = 0;
        do {
            const transaction = await this.sequelizeTypescript.transaction(transactionOptions as any) as Transaction;
            try {
                const result: T = await task(transaction);
                await transaction.commit();
                return result;
            } catch (e) {
                await transaction.rollback();
                if (this.isSerializationError(e)) {
                    transactionFailCount += 1;
                    this.logger.warn(`repeating transaction ${transactionFailCount}`, e);
                } else {
                    throw e;
                }
            }
        } while (transactionFailCount < transactionFailLimit);
        throw ErrorList.DatabaseError;
    }

    public async close() {
        await this.sequelizeTypescript.close();
    }

    public async applyMigrations(direction: "up" | "down" = "up",
                                 options?: any): Promise<Array<Migration>> {
        const migrator: Umzug.Umzug = this.getMigrator(this.migrationsDir);
        const result: Array<Migration> = await migrator[direction](options);
        if (this.databaseConfig.logMigrations) {
            this.logger.info(result.length + ` migration${result.length === 1 ? "" : "s"} ` + direction);
        }
        return result;
    }

    private isSerializationError(e: any): boolean {
        if (Array.isArray(e)) {
            for (const i in e as Array<any>) {
                if (this.isSerializationError(e[i])) {
                    return true;
                }
            }
            return false;
        } else {
            // https://www.postgresql.org/docs/10/static/transaction-iso.html
            const serializationFailureCode = "40001";
            return e.code === serializationFailureCode || e.parent && e.parent.code === serializationFailureCode;
        }
    }

    private async migrate(rollBack: boolean = false): Promise<void> {
        if (rollBack) {
            await this.applyMigrations("down", {to: 0});
        }
        await this.applyMigrations("up");
    }

    // TODO: Update sequelize typings and get rid of "any"
    private getMigrator(dir: string): Umzug.Umzug {
        return new Umzug({
            storage: "sequelize",
            storageOptions: {
                sequelize: this.sequelizeTypescript as any,
            },
            logging: (result: any) => {
                this.logger.debug(result);
            },
            migrations: {
                params: [this.sequelizeTypescript.getQueryInterface(), this.sequelizeTypescript.Sequelize],
                path: dir,
                pattern: /^\d+[\w-]+\.js$/,
                wrap: (fun: any) => {
                    return fun;
                },
            },
        });
    }

}
