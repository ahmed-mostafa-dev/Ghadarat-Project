import { CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../users/decorators/user-role.decorator";
import { UserRole } from "../userRole.enum";


export class RolesGuard implements CanActivate{
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean  {
        
        const requiredRoles =this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY,[
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