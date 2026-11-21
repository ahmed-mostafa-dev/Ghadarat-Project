import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { VideosService } from "./services/videos.service";
import { RequestPresignedUrlDto } from "./dtos/request-presigned-url.dto";
import { UserRole } from "../common/userRole.enum";
import { QueryVideosDto } from "./dtos/query-videos.dto";
import { ConfirmUploadDto } from "./dtos/confirm-upload.dto";

@Controller('videos')
export class VideosController {
    constructor(
        private readonly videosService: VideosService
    ) {}

    @Post('upload-url')
    public async requestUpload(
        @Body() body: RequestPresignedUrlDto,
        @Req() req: any
    ) {
        return this.videosService.requestUpload({
            studentId: req.user.id,
            classroomId: req.user.classroomId,
            competencyName: body.competencyName,
            title: body.title,
            fileSize: body.fileSize,
            contentType: body.contentType
        });
    }


    @Patch('confirm-upload')
    public async confirmUpload(
        @Body() body: ConfirmUploadDto,
        @Req() req: any
    ) {
        return this.videosService.markAsUploaded(
            body.videoId,
            req.user.id
        );
    }


    @Get(':id/playback')
    public async getPlaybackUrl(@Param('id') videoId: string, @Req() req: any) {
        return this.videosService.getPlaybackUrl(
            videoId,
            req.user.id,
            req.user.role as UserRole
        );
    }

    // Get videos for the current user (student)
    @Get('my-videos') 
    public async getVideos(@Query() query: QueryVideosDto, @Req() req: any) {
      return this.videosService.getVideos(
        req.user.id,
        query,
      );
    }


    @Delete(':id')
    public async deleteVideo(@Param('id') videoId: string, @Req() req:any ) {
        return this.videosService.removeVideo(
            videoId,
            req.user.id,
            req.user.role as UserRole
        );
    }
}
