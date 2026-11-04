import { UserRole } from "./userRole.enum";

export type JWTUserPayload = {
    id:string;
    userType: UserRole;
}


export type AccessTokenType = {
    accessToken: string;
    refreshToken: string;
}