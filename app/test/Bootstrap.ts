import * as chai from "chai";
import "reflect-metadata";
import {app} from "../app";

chai.should();
chai.use(require("chai-things"));
chai.use(require("chai-subset"));
chai.use(require("chai-date-string"));

before(function() {
    this.timeout(25000);
    return app();
});
