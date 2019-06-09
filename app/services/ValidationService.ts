import {injectable} from "inversify";
import {APIError} from "../core/APIError";
import {ErrorList} from "../ErrorList";

@injectable()
export default class ValidationService {

    private validator: any;

    constructor() {
        const Validator = require("fastest-validator");
        this.validator = new Validator();
    }

    public validate(data: any, schema: any) {
        const result = this.validator.validate(data, schema);
        if (result !== true) {
            throw new APIError(ErrorList.ValidationError, {meta: result});
        }
    }

}