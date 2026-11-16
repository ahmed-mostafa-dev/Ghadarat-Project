import { GradeLevel } from "../enums/grade-level.enum";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { Track } from "../enums/track.enum";
import { Term } from "../enums/term.enum";
import { Transform, Type } from "class-transformer";

export class QueryClassroomDto {

  
  @IsOptional()
  @IsEnum(GradeLevel)
  gradeLevel?: GradeLevel;
  
  @IsOptional()
  @IsEnum(Track)
  track?: Track;
  
  @IsOptional()
  @IsEnum(Term)
  term?: Term;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(70)
  limit: number = 10;
  
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  search?: string;
}