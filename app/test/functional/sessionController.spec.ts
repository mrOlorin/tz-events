import * as supertest from "supertest";
import * as chai from "chai";
import {Utils} from "../Utils";
import {serverConfig} from "../../config/ServerConfig";
import container from "../../core/ioc/container";
import {TYPES} from "../../core/ioc/types";
import UserService from "../../services/UserService";
import {ErrorList} from "../../ErrorList";
import User from "../../models/User";

describe("SessionController", async () => {

    const server = supertest.agent(`http://${serverConfig.url}:${serverConfig.port}`);

    const userService: UserService = container.get<UserService>(TYPES.UserService);

    describe("POST /v1/session", async () => {
        it(`Returns "${ErrorList.ValidationError.message}" error when called without params`, async () => {
            server
                .post("/v1/session")
                .type("form")
                .expect(ErrorList.ValidationError.status)
                .end(async (err: any, res: any) => {
                    if (err) {
                        throw err;
                    }
                    Utils.expectRequestError(res.body, ErrorList.ValidationError);
                });
        });
        it(`Returns auth token`, async () => {
            const testEmail: string = "some@email.com";
            const testPassword: string = "randompassword";
            const testUser: User = await userService.create({email: testEmail, password: testPassword});
            const res = await server
                .post("/v1/session")
                .type("form")
                .send({
                    email: testUser.email,
                    password: testPassword,
                })
                .expect(200);
            chai.expect(res.body)
                .to.have.property("token").which.is.a("string")
                .with.lengthOf.above(10);
            chai.expect(res.body)
                .to.have.property("expiresIn").which.is.a("number");
            chai.expect(res.body)
                .to.have.property("user").which.has.deep.property("email", testUser.email);
        });
    });
});
