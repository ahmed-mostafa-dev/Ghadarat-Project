import { ConflictException, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dtos/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { UserRole } from "../common/userRole.enum";
import { LoginDto } from "./dtos/login.dto";


@Injectable()
export class AuthService {
constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService){}  


public async register(registerDto: RegisterDto){
    const {username, password} = registerDto;
    const findUser = await this.usersService.findOneByUsername(username) ;
   
    if(findUser)  throw new ConflictException('اسم المستخدم مستخدم بالفعل');

    const newUser = await this.usersService.createUser({
        ...registerDto,
        role: UserRole.STUDENT
    });

    const payload = {
        sub: newUser.id ,
        username: newUser.username,
        role: newUser.role
    };
    const accessToken = await this.jwtService.signAsync(payload)

    return {
        message: 'تم إنشاء الحساب بنجاح',
        accessToken,
        user:{ 
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
        }
    };   
}



public async login(loginDto: LoginDto){
const {username, password} = loginDto;
const user = await this.usersService.findOneByUsername(username);
if(!user) throw new ConflictException('اسم المستخدم غير صحيح');

const isPasswordValid = await bcrypt.compare(password, user.password);
if(!isPasswordValid) throw new ConflictException('كلمة المرور غير صحيحة');

const payload = {
    sub: user.id ,
    username: user.username,
    role: user.role
};
const accessToken = await this.jwtService.signAsync(payload)

return {
    message: 'تم تسجيل الدخول بنجاح',
    accessToken,
    user:{ 
        id: user.id,
        username: user.username,
        role: user.role
    }
}
}

public async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10) 
    return hashedPassword
}
}