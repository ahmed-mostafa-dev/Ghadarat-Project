import { Transform } from "class-transformer";
import { IsDateString, IsString, Length } from "class-validator"

export class CreateAcademicYearDto {
    @Transform(({ value }) => value?.trim())
    @IsString()
    @Length(2,50)
    name: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}