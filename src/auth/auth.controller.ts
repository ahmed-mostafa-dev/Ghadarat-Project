import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { Public } from "../common/public.decorator";
import { Throttle } from "@nestjs/throttler";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

@Public()
@Post('register')
public register(@Body() body: RegisterDto) {
    return this.authService.register(body);
}


@Public()
@Throttle({default: {limit: 4, ttl: 60000}})
@Post('login')
public login(@Body() body: LoginDto) {
    return this.authService.login(body);
}

}