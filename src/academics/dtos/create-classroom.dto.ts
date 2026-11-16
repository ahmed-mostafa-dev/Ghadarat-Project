import { IsEnum, IsNotEmpty, IsString, IsUUID, Length} from "class-validator";
import { GradeLevel } from "../enums/grade-level.enum";
import { Term } from "../enums/term.enum";
import { Track } from "../enums/track.enum";
import { Transform } from "class-transformer";

export class CreateClassroomDto {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(2, 50)
  name: string;

  @IsNotEmpty()
  @IsEnum(GradeLevel)
  gradeLevel: GradeLevel

  @IsNotEmpty()
  @IsEnum(Term)
  term: Term

  @IsNotEmpty()
  @IsEnum(Track)
  track: Track

  @IsNotEmpty()
  @IsUUID('4')
  academicYearId: string
}