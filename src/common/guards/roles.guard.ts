import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../users/decorators/user-role.decorator";
import { UserRole } from "../userRole.enum";
import { IS_PUBLIC_KEY } from "../public.decorator";


@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector: Reflector) {}
    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const isPublic = await this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if(isPublic) return true;

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass()
        ])

        if(!requiredRoles || requiredRoles.length === 0) return true

        // const request = context.switchToHttp().getRequest()
        // const user = request.user

        const {user} = context.switchToHttp().getRequest()
        if(!user) throw new UnauthorizedException()
        
        if(!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('ليس لديك صلاحية لتنفيذ هذا الإجراء')
        }
        
        return true
    }
    
}