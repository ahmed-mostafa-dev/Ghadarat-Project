import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "../common/guards/auth.guard";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

@Post('register')
public register(@Body() body: RegisterDto) {
    return this.authService.register(body);
}


@Post('login')
public login(@Body() body: LoginDto) {
    return this.authService.login(body);
}

}