import {interfaces} from "inversify-express-utils";
import User from "../models/User";

export default class Principal implements interfaces.Principal {
    public details: User | null;

    public constructor(user: User | null) {
        this.details = user;
    }

    public async isAuthenticated(): Promise<boolean> {
        return this.details !== null;
    }

    public async isResourceOwner(resourceId: any): Promise<boolean> {
        return resourceId === 1111;
    }

    public async isInRole(role: string): Promise<boolean> {
        return role === "admin";
    }
}
