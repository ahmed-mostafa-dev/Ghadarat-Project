import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CURRENT_USER_KEY } from "../../common/constants";
import { JWTUserPayload } from "../../common/types";



// to create a custom decorator to get the current user from the request object

export const CurrentUser =createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const payload: JWTUserPayload = request[CURRENT_USER_KEY]
    return payload;
})