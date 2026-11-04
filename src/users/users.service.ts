import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Not, Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import * as bcrypt from 'bcrypt';
import { JWTUserPayload } from "../common/types";
import { UserRole } from "../common/userRole.enum";

// import { AuthService } from "../auth/auth.service";



@Injectable()
export class UsersService {
    create(arg0: { username: string; password: string; }) {
        throw new Error("Method not implemented.");
    }

   

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        // private readonly authService: AuthService
    ) {}

    public findAllUsers() : Promise<User[]> {
        return this.userRepository.find();
    }

    /**
     * 
     * @param dto create user dto
     * @returns created user
     */
    public async createUser(dto: CreateUserDto) {
        const exists = await this.userRepository.exists({
            where: {username: dto.username}
        })
        if (exists) {
            throw new ConflictException('Username already exists');
        }
        const newUser = this.userRepository.create({
            name: dto.name,
            username: dto.username,
            password: await this.hashPassword(dto.password),
            role: dto.role
        });
        const saved = await this.userRepository.save(newUser);
        return { ...saved}

    }
  

    /**
     * 
     * @param id user id
     * @param dto update user dto
     * @returns updated user
     */
    public async updateUser(id: string, dto: UpdateUserDto) {
    const { username, password } = dto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User id ${id} is not found`);

    if (username) {
        const existedUser = await this.userRepository.exists({
            where: {  username, id: Not(id) } // لازم دي
        });
        if (existedUser) throw new ConflictException('Username already exists'); // Conflict مش NotFound
        user.username = username;
    }

    if (password) {
        user.password = await this.hashPassword(password)
    }

    const saved = await this.userRepository.save(user);
    return saved
}
    
    /**
     * 
     * @param userId user id
     * @param payload user payload
     * @returns deleted user
     */
    public async deleteUser(userId: string, payload: JWTUserPayload) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User id ${userId} is not found`);
        
        if (user.id !== payload?.id &&
            payload?.userType !== UserRole.ADMIN &&
            payload?.userType !== UserRole.VERIFIER) {
            throw new ForbiddenException('You are not allowed to delete this user');
            }

        await this.userRepository.softDelete(userId);
        return { message: 'User deleted successfully' };

   }


    /**
     * 
     * @param id user id
     * @returns current user
     */
    public async getCurrentUser(id: string ): Promise<User> {
        const user = await this.userRepository.findOne({ where: {id}});
        if (!user) throw new NotFoundException('User is not found');
        return user;
    }


    /**
     * 
     * @param password password
     * @returns hashed password
     */
    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }


    public async findOneByUsername(username: string) {
        return await this.userRepository.findOne({ where: { username } });
    }

}
