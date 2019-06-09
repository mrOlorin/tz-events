import * as supertest from "supertest";
import * as chai from "chai";
import {Utils} from "../Utils";
import {serverConfig} from "../../config/ServerConfig";
import container from "../../core/ioc/container";
import {TYPES} from "../../core/ioc/types";
import {ErrorList} from "../../ErrorList";
import User from "../../models/User";
import Event from "../../models/Event";
import AuthProvider from "../../middleware/AuthProvider";
import FakeService from "../../services/FakeService";
import AuthService from "../../services/AuthService";

describe("EventController", async () => {

    const server = supertest.agent(`http://${serverConfig.url}:${serverConfig.port}`);

    const authService: AuthService = container.get<AuthService>(TYPES.AuthService);
    const fakeService: FakeService = container.get<FakeService>(TYPES.FakeService);

    describe("POST /v1/event", async () => {

        it(`Returns "${ErrorList.AccessDenied.message}" error when called without auth token`, async () => {
            const eventData = {
                name: "Some name",
                startDate: new Date("2030-01-01"),
                endDate: new Date("2031-01-01"),
            };
            const res = await server
                .post("/v1/event")
                .type("form")
                .send(eventData)
                .expect(ErrorList.AccessDenied.status);
            Utils.expectRequestError(res.body, ErrorList.AccessDenied);
        });

        it(`Returns "${ErrorList.ValidationError.message}" error when called without name`, async () => {
            const user: User = await fakeService.createUser();
            const authToken: string = await authService.generateAuthToken(user);
            const eventData = {
                startDate: new Date("2030-01-01"),
                endDate: new Date("2031-01-01"),
            };
            const res = await server
                .post("/v1/event")
                .type("form")
                .send(eventData)
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(ErrorList.ValidationError.status);
            Utils.expectRequestError(res.body, ErrorList.ValidationError);
            chai.expect(res.body.errors[0].meta[0]).to.contain(
                {type: 'required', field: 'name'}
            );
        });

        it(`Returns "${ErrorList.EventNameInvalid.message}" error when called with duplicate name`, async () => {
            const firstEvent = await fakeService.createEvent();

            const user: User = await fakeService.createUser();
            const authToken: string = await authService.generateAuthToken(user);

            const eventData = {
                name: firstEvent.name,
                startDate: new Date("2030-01-01"),
                endDate: new Date("2031-01-01"),
            };
            const res = await server
                .post("/v1/event")
                .type("form")
                .send(eventData)
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(ErrorList.EventNameInvalid.status);
            Utils.expectRequestError(res.body, ErrorList.EventNameInvalid);
        });

        it(`Creates event`, async () => {
            const user: User = await fakeService.createUser();
            const authToken: string = await authService.generateAuthToken(user);

            const eventData = {
                name: "Some name",
                startDate: "2030-01-01",
                endDate: "2031-01-01",
            };
            const res = await server
                .post("/v1/event")
                .type("form")
                .send(eventData)
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(200);
            chai.expect(res.body).to.have.property("event");
            chai.expect(res.body.event).to.have.property("name", eventData.name);
        });
    });

    describe("PATCH /v1/event/:eventId", async () => {

        let event: Event;
        let authToken: string;

        before(async () => {
            event = await fakeService.createEvent();
            const user: User = await fakeService.createUser();
            authToken = await authService.generateAuthToken(user);
        });

        it(`Returns "${ErrorList.AccessDenied.message}" error when called without auth token`, async () => {
            const eventData = {
                name: "Some name",
                startDate: new Date("2030-01-01"),
                endDate: new Date("2031-01-01"),
            };
            const res = await server
                .patch(`/v1/event/${event.id}`)
                .type("form")
                .send(eventData)
                .expect(ErrorList.AccessDenied.status);
            Utils.expectRequestError(res.body, ErrorList.AccessDenied);
        });

        it(`Returns "${ErrorList.ValidationError.message}" error when called with invalid id`, async () => {
            const res = await server
                .patch("/v1/event/qwe")
                .type("form")
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(ErrorList.ValidationError.status);
            Utils.expectRequestError(res.body, ErrorList.ValidationError);
            chai.expect(res.body.errors[0].meta[0]).to.contain(
                {type: 'uuid', field: 'eventId'}
            );
        });

        it(`Returns "${ErrorList.EventNotFound.message}" error when called with non-existent id`, async () => {
            const res = await server
                .patch("/v1/event/bc2cd4bc-b5df-507b-85f6-2173cbf3ae53")
                .type("form")
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(ErrorList.EventNotFound.status);
            Utils.expectRequestError(res.body, ErrorList.EventNotFound);
        });

        it(`Updates event`, async () => {
            const newName = "qwe";
            const res = await server
                .patch(`/v1/event/${event.id}`)
                .type("form")
                .send({name: newName})
                .set(AuthProvider.AUTH_HEADER, "Bearer " + authToken)
                .expect(200);
            chai.expect(res.body).to.have.property("event");
            chai.expect(res.body.event).to.have.property("name", newName);
        });
    });

    describe("GET /v1/event/:eventId", async () => {
        let event: Event;
        before(async () => {
            event = await fakeService.createEvent();
        });

        it(`Returns "${ErrorList.ValidationError.message}" error when called with invalid id`, async () => {
            const res = await server
                .get("/v1/event/qwe")
                .type("form")
                .expect(ErrorList.ValidationError.status);
            Utils.expectRequestError(res.body, ErrorList.ValidationError);
            chai.expect(res.body.errors[0].meta[0]).to.contain(
                {type: 'uuid', field: 'eventId'}
            );
        });

        it(`Returns "${ErrorList.EventNotFound.message}" error when called with non-existent id`, async () => {
            const res = await server
                .get("/v1/event/bc2cd4bc-b5df-507b-85f6-2173cbf3ae53")
                .type("form")
                .expect(ErrorList.EventNotFound.status);
            Utils.expectRequestError(res.body, ErrorList.EventNotFound);
        });

        it(`Returns event`, async () => {
            const res = await server
                .get(`/v1/event/${event.id}`)
                .type("form")
                .expect(200);
            chai.expect(res.body).to.have.property("event");
            chai.expect(res.body.event).to.have.property("name", event.name);
        });
    });

    describe("GET /v1/event/:eventId", async () => {
        let events: Array<Event>;
        before(async () => {
            events = await fakeService.createEvents(11);
        });

        it(`Returns event list`, async () => {
            const res = await server
                .get(`/v1/event`)
                .type("form")
                .expect(200);
            chai.expect(res.body).to.have.property("eventList")
                .which.is.an("array").with.lengthOf(10);
        });
    });

});
