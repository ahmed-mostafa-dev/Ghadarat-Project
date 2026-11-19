import { IsArray, ArrayNotEmpty, ArrayMinSize, ArrayUnique, IsUUID, ArrayMaxSize, IsNotEmpty } from "class-validator";

export class AssignStudentsDto {

  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

 @IsArray()
 @ArrayNotEmpty()
 @ArrayMaxSize(100)
 @ArrayUnique()
 @IsUUID('4', { each: true })
studentIds: string[]   
}