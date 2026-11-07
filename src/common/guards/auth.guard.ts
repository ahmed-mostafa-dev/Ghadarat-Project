import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../public.decorator";



@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const isPublic = await this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if(isPublic) return true;

        
       const request = context.switchToHttp().getRequest();
       const header = request.headers.authorization
       if(!header) throw new UnauthorizedException('لا يوجد توكن')
       const [bearer , token] = header?.split(' ')
       if(bearer !== 'Bearer') throw new UnauthorizedException('التوكن غير صالح')

        const payload = await this.validateToken(token)
        if(!payload) throw new UnauthorizedException('ليس لديك صلاحية')
        request['user'] = payload
        return true
    }



    private async validateToken(token: string): Promise<boolean>{
        try{
           const payload = await this.jwtService.verifyAsync(token,
            {
                secret: process.env.JWT_SECRET
            }
           )
           return payload;
        }catch(error){
             throw new UnauthorizedException('التوكن غير صالح');
        }
    }
    
}