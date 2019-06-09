import {inject, injectable} from "inversify";
import {DatabaseService} from "./DatabaseService";
import {TYPES} from "../core/ioc/types";
import {Logger} from "../core/Logger";
import Event from "../models/Event";
import ValidationService from "./ValidationService";
import {APIError} from "../core/APIError";
import {ErrorList} from "../ErrorList";
import {operatorsAliases as Op} from "./DatabaseService/sequelizeOperatorAliases";

@injectable()
export default class EventService {

    @inject(TYPES.Logger) protected logger: Logger;
    @inject(TYPES.DatabaseService) protected databaseService: DatabaseService;
    @inject(TYPES.ValidationService) protected validationService: ValidationService;

    public async create(eventData: Partial<Event>): Promise<Event> {
        this.validationService.validate(eventData, {
            name: {type: "string", min: 1, max: 255},
            startDate: {type: "date", convert: true},
            endDate: {type: "date", convert: true},
            $$strict: true,
        });
        if (await this.eventNameOccupied(eventData.name as string)) {
            throw new APIError(ErrorList.EventNameInvalid, {meta: {name: eventData.name}});
        }
        return await Event.create(eventData, {returning: true});
    }

    public async update(eventId: string, eventData: Partial<Event>): Promise<Event> {
        this.validationService.validate({eventId, ...eventData}, {
            eventId: {type: "uuid"},
            name: {type: "string", min: 1, max: 255, optional: true},
            startDate: {type: "date", convert: true, optional: true},
            endDate: {type: "date", convert: true, optional: true},
            $$strict: true,
        });
        const event = await Event.findOne({where: {id: eventId}});
        if (!event) {
            throw new APIError(ErrorList.EventNotFound, {meta: {eventId}});
        }
        if (await this.eventNameOccupied(eventData.name as string, eventId)) {
            throw new APIError(ErrorList.EventNameInvalid, {meta: {name: eventData.name}});
        }
        const updateResult = await Event.update(eventData, {where: {id: eventId}, returning: true});
        return updateResult[1][0];
    }

    public async getById(eventId: string): Promise<Event> {
        this.validationService.validate({eventId}, {
            eventId: {type: "uuid"},
            $$strict: true,
        });
        const event = await Event.findOne({where: {id: eventId}});
        if (!event) {
            throw new APIError(ErrorList.EventNotFound, {meta: {eventId}});
        }
        return event;
    }

    public async getList(params: { limit: number, offset: number } = {limit: 10, offset: 0}): Promise<Array<Event>> {
        if (!params.limit) {
            params.limit = 10;
        }
        if (!params.offset) {
            params.offset = 0;
        }
        this.validationService.validate(params, {
            limit: {type: "number", integer: true, positive: true, max: 1e6},
            offset: {type: "number", integer: true, min: 0, max: 1e6},
            $$strict: true,
        });
        return await Event.findAll({
            limit: params.limit,
            offset: params.offset,
        });
    }

    private async eventNameOccupied(eventName: string, exceptForId?: string): Promise<boolean> {
        const options: any = {
            where: {
                name: {[Op.$like]: eventName}
            }
        };
        if (exceptForId) {
            options.where.id = {[Op.$ne]: exceptForId};
        }
        return !!await Event.findOne(options);
    }

}
