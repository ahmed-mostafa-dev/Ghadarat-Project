import { IsIn, Max, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class RequestPresignedUrlDto {
  @IsString()
  @IsNotEmpty() 
  competencyName: string;

  @IsInt()
  @Min(1)
  @Max(30 * 1024 * 1024)
  fileSize: number; // 30MB

  @IsIn(['video/mp4', 'video/webm'])
  contentType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}


