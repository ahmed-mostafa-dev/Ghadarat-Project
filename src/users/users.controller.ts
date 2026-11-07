import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { User } from "./users.entity";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserRole } from "../common/userRole.enum";
import { Roles } from "./decorators/user-role.decorator";
import type { JWTUserPayload } from "../common/types";



@Controller('users')
export class UsersController {
constructor(private readonly usersService: UsersService){}

@Get('search/students')
public async searchStudents(@Query('name') name: string){
    return await this.usersService.searchStudents(name);
}

@Get()
public getAllUsers() {
    return this.usersService.findAllUsers();
}


@Post()
@Roles(UserRole.ADMIN, UserRole.VERIFIER)
public createUser( @Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
}


@Get(':id')
public getUserById(
    @Param('id',ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.getUserById(id);
}


@Patch(':id')
public updateUser(
    @Param('id', new ParseUUIDPipe ()) id: string,
    @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(id, payload);
}


@Delete(':id')
public deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() payload:JWTUserPayload) {
    return this.usersService.deleteUser(id, payload);
}

}