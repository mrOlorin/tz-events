import * as faker from "faker";
import {inject, injectable} from "inversify";
import {TYPES} from "../core/ioc/types";
import UserService from "./UserService";
import User from "../models/User";
import Event from "../models/Event";
import EventService from "./EventService";

@injectable()
export default class FakeService {

    @inject(TYPES.UserService) protected userService: UserService;
    @inject(TYPES.EventService) protected eventService: EventService;

    public getUserData(): Partial<User> {
        return {
            email: faker.internet.email(),
            password: faker.internet.password(),
        };
    }

    public getEventData(): Partial<Event> {
        return {
            name: faker.lorem.words(5),
            startDate: faker.date.past(),
            endDate: faker.date.future(),
        };
    }

    public async createUser(): Promise<User> {
        return await this.userService.create(this.getUserData());
    }

    public async createUsers(userNumber: number): Promise<Array<User>> {
        const requests: Array<Promise<User>> = [];
        for (let i = 0; i < userNumber; i++) {
            requests.push(this.createUser());
        }
        return await Promise.all(requests);
    }

    public async createEvent(): Promise<Event> {
        const eventData = this.getEventData();
        return await this.eventService.create(eventData);
    }

    public async createEvents(eventNumber: number): Promise<Array<Event>> {
        const requests: Array<Promise<Event>> = [];
        for (let i = 0; i < eventNumber; i++) {
            requests.push(this.createEvent());
        }
        return await Promise.all(requests);
    }
}
