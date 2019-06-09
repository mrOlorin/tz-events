import {BaseHttpController, controller, httpPost, requestBody} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../core/ioc/types";
import AuthService from "../services/AuthService";

@controller("/v1/session")
export default class SessionController extends BaseHttpController {

    @inject(TYPES.AuthService)
    private authService: AuthService;

    @httpPost("/")
    private async create(@requestBody() body: any) {
        return await this.authService.authenticate(body.email, body.password);
    }

}
