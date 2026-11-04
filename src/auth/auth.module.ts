import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "../common/guards/auth.guard";


@Module({
    imports: [UsersModule,
               JwtModule.registerAsync({
               global: true,
               imports: [ConfigModule],
               inject: [ConfigService],
               useFactory: (config: ConfigService) => {
                return {
                    
                    secret: config.get<string>('JWT_SECRET'),
                    signOptions: {expiresIn: config.get<any>('JWT_EXPIRES_IN')}
                }
            }
        }), 
    ],
    controllers: [AuthController],
    providers: [{provide: APP_GUARD, useClass: AuthGuard}, AuthService],
    exports: [],
})
export class AuthModule {}