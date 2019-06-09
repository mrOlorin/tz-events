import * as chai from "chai";
import {APIError} from "../core/APIError";

export class Utils {

    public static expectRequestError(body: {}, error: APIError) {
        return chai.expect(body)
            .to.have.property("errors").which.is.an("array")
            .which.includes.something.that.have.property("code", error.code);
    }

    public static expectError(result: {}, error: APIError) {
        if (Array.isArray(result)) {
            return chai.expect(result).to.be.an("array")
                .which.includes.something.that.have.property("code", error.code);
        }
        return chai.expect(result).to.have.property("code", error.code);
    }

    public static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
