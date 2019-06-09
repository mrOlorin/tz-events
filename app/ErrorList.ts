import {APIError} from "./core/APIError";

export class ErrorList {

    // Missing fields
    public static readonly UserIdRequired = new APIError(400, 100, "User id required");
    public static readonly EmailRequired = new APIError(400, 101, "Email required");
    public static readonly PasswordRequired = new APIError(400, 102, "Password required");

    // Duplicates
    public static readonly UserAlreadyExists = new APIError(409, 200, "User already exists");

    // Validation
    public static readonly AuthTokenInvalid = new APIError(400, 300, "Auth token invalid");
    public static readonly EventNameInvalid = new APIError(400, 301, "Event name invalid");

    // Not found
    public static readonly UserNotFound = new APIError(404, 400, "User not found");
    public static readonly EventNotFound = new APIError(404, 401, "Event not found");

    // Access
    public static readonly AccessDenied = new APIError(403, 500, "Access denied");
    public static readonly NotAuthorized = new APIError(401, 501, "Not authorized");

    // Internal server Error
    public static readonly InternalServerError = new APIError(500, 600, "Internal server error");
    public static readonly UnknownServerError = new APIError(500, 601, "Unknown server error");
    public static readonly DatabaseError = new APIError(500, 602, "Database error");
    public static readonly ConfigError = new APIError(500, 603, "Config error");
    public static readonly PasswordHashError = new APIError(500, 604, " Password hash error");
    public static readonly PasswordCompareError = new APIError(500, 605, "Password comparing error");

    // Common errors

    public static readonly ValidationError = new APIError(400, 701, "Validation error");

}
