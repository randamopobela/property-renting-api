import { IUserLogin } from "./user.interface";

declare global {
    namespace Express {
        export interface Request {
            user?: IUserLogin;
        }
    }
}
