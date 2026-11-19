import { IsOptional, IsInt, Min, IsEnum, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoStatus } from '../enums/video-status.enum';

export class QueryVideosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(70)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;
}