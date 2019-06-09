import {
    BaseHttpController,
    controller,
    httpGet,
    httpPatch,
    httpPost,
    requestBody,
    requestParam
} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../core/ioc/types";
import EventService from "../services/EventService";

@controller("/v1/event")
export default class EventController extends BaseHttpController {

    @inject(TYPES.EventService)
    private eventService: EventService;

    @httpPost("/", TYPES.AuthMiddleware)
    private async create(@requestBody() body: any) {
        return {event: await this.eventService.create(body)};
    }

    @httpPatch("/:eventId", TYPES.AuthMiddleware)
    private async update(@requestParam("eventId") eventId: string,
                         @requestBody() body: any) {
        return {event: await this.eventService.update(eventId, body)};
    }

    @httpGet("/:eventId")
    private async getById(@requestParam("eventId") eventId: string,) {
        return {event: await this.eventService.getById(eventId)};
    }

    @httpGet("/")
    private async getList(@requestBody() body: any,) {
        return {eventList: await this.eventService.getList(body)};
    }

}
