import { IsEnum, IsNotEmpty, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Transform } from 'class-transformer';
import { UserRole } from "../../common/userRole.enum";

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase().trim())
    @Length(3, 150) 
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    password: string;


    @IsEnum(UserRole, { message: 'يجب اختيار دور صالح (طالب، مقيم، غرفة_الجدارات، المدير)' })
    @IsNotEmpty({message: "Role is required"})
    role: UserRole;
}
