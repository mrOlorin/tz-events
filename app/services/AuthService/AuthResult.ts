import User from "../../models/User";

export interface AuthResult {
    token: string;
    user: User;
    expiresIn: number;
    isNewUser?: boolean;
}
