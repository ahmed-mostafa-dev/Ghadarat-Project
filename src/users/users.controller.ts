import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { User } from "./users.entity";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserRole } from "../common/userRole.enum";
import { Roles } from "./decorators/user-role.decorator";
import type { JWTUserPayload } from "../common/types";
import { AuthGuard } from "../common/guards/auth.guard";


@Controller('users')
export class UsersController {
constructor(private readonly usersService: UsersService){}
    
@UseGuards(AuthGuard)
@Get()
@Roles(UserRole.ADMIN, UserRole.ASSESSOR, UserRole.VERIFIER)
public getAllUsers() {
    return this.usersService.findAllUsers();
}

@UseGuards(AuthGuard)
@Get(':id')
@Roles(UserRole.ADMIN, UserRole.ASSESSOR, UserRole.VERIFIER)
public getCurrentUser(
    @Param('id',ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.getCurrentUser(id);
}

@UseGuards(AuthGuard)
@Post()
@Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.VERIFIER)
public createUser( @Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
}

@UseGuards(AuthGuard)
@Patch(':id')
@Roles(UserRole.ADMIN, UserRole.ASSESSOR, UserRole.VERIFIER)
public updateUser(
    @Param('id',ParseUUIDPipe) id: string,
    @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(id, payload);
}

@UseGuards(AuthGuard)
@Delete(':id')
@Roles(UserRole.ADMIN, UserRole.ASSESSOR, UserRole.VERIFIER)
public deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() payload:JWTUserPayload) {
    return this.usersService.deleteUser(id, payload);
}

}