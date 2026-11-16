import { IsArray, ArrayNotEmpty, ArrayMinSize, ArrayUnique, IsUUID, ArrayMaxSize } from "class-validator";

export class AssignStudentsDto {
 @IsArray()
 @ArrayNotEmpty()
 @ArrayMinSize(1)
 @ArrayMaxSize(100)
 @ArrayUnique()
 @IsUUID('4', { each: true })
studentIds: string[]   
}