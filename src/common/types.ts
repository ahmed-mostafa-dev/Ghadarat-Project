import { UserRole } from "./userRole.enum";

export type JWTUserPayload = {
    sub:string;
    role:string;
    id?:string;
    userType?: UserRole;
    username?:string;
}


export type AccessTokenType = {
    accessToken: string;
    refreshToken: string;
}