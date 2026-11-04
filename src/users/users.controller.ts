import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { User } from "./users.entity";
import { UpdateUserDto } from "./dtos/update-user.dto";
import * as types from "../common/types";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserRole } from "../common/userRole.enum";
import { Roles } from "./decorators/user-role.decorator";
import type { JWTUserPayload } from "../common/types";
import { AuthGuard } from "../common/guards/auth.guard";


@Controller('users')
export class UsersController {
constructor(private readonly usersService: UsersService){}
    

@Get()
public getAllUsers() {
    return this.usersService.findAllUsers();
}

@Get(':id')
public getCurrentUser(
    @Param('id',ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.getCurrentUser(id);
}

@Post()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
public createUser( @Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
}


@Patch(':id')
public updateUser(
    @Param('id',ParseUUIDPipe) id: string,
    @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(id, payload);
}

@UseGuards(AuthGuard)
@Delete(':id')
public deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() payload:JWTUserPayload) {
    // const payload = {
    //     id,
    //     userType: UserRole.ADMIN
    // }
    return this.usersService.deleteUser(id,
        payload
    );
}

}