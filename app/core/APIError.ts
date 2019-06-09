export class APIError extends Error {
    public status: number;
    public code: number;
    public title?: string;
    public meta?: {};
    public errors: Array<APIError>;

    constructor(status: number | APIError, code?: number | {}, title?: string, meta?: {}) {
        if (typeof status === "number") {
            super(title);
        } else {
            const baseError: APIError = status as APIError;
            if (!baseError) {
                throw new Error("Undefined APIError" + code ? ": " + code : "");
            }
            const error = code as APIError;
            super(error.title || baseError.title);
            status = error.status || baseError.status;
            code = error.code || baseError.code;
            title = error.title || baseError.title;
            meta = error.meta || baseError.meta;
            this.errors = error.errors || baseError.errors;
        }
        this.status = status;
        this.code = code as number;
        this.title = title;
        this.meta = meta;
    }

}
