import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { VideosService } from "./services/videos.service";
import { RequestPresignedUrlDto } from "./dtos/request-presigned-url.dto";
import { UserRole } from "../common/userRole.enum";
import { QueryVideosDto } from "./dtos/query-videos.dto";
import { ConfirmUploadDto } from "./dtos/confirm-upload.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { Roles } from "../users/decorators/user-role.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import type { JWTUserPayload } from "../common/types";

@Controller('videos')
export class VideosController {
    constructor(
        private readonly videosService: VideosService
    ) {}

    @UseGuards(AuthGuard)
    @Roles(UserRole.STUDENT, UserRole.ASSESSOR, UserRole.VERIFIER, UserRole.ADMIN)
    @Post('upload-url')
    public async requestUpload(
        @Body() body: RequestPresignedUrlDto,
        @Req() req: any
    ) {
        return this.videosService.requestUpload({
            studentId: req.user.id,
            // classroomId: req.user.classroomId,
            competencyName: body.competencyName,
            title: body.title,
            fileSize: body.fileSize,
            contentType: body.contentType
        });
    }

    @UseGuards(AuthGuard)
    @Roles(UserRole.STUDENT)
    @Patch('confirm-upload')
    public async confirmUpload(
        @Body() body: ConfirmUploadDto,
        @CurrentUser() user: JWTUserPayload
    ) {
        return this.videosService.markAsUploaded(
            body.videoId,
            user.sub
        );
    }

    @UseGuards(AuthGuard)
    @Roles(UserRole.STUDENT, UserRole.ASSESSOR, UserRole.VERIFIER, UserRole.ADMIN)
    @Get(':id/playback')
    public async getPlaybackUrl(@Param('id') videoId: string, @Req() req: any) {
        return this.videosService.getPlaybackUrl(
            videoId,
            req.user.id,
            req.user.role as UserRole
        );
    }

    // Get videos for the current user (student)
    @UseGuards(AuthGuard)
    @Roles(UserRole.STUDENT)
    @Get('student/my-videos') 
    public async getVideos(@Query() query: QueryVideosDto, @Req() req: any) {
      return this.videosService.getVideos(
        req.user.id,
        query,
      );
    }

    @UseGuards(AuthGuard)
    @Roles(UserRole.ASSESSOR, UserRole.VERIFIER, UserRole.ADMIN)
    @Get('all-videos')
    public async getAllVideos(@Query() query: QueryVideosDto, @CurrentUser() user: JWTUserPayload) {
        return this.videosService.getVideosByOthers(
           user.role as UserRole,
           query
        );
    }


    @Get('student/:studentId/videos')
    public async getStudentVideos(@Param('studentId') studentId: string, @Query() query: QueryVideosDto, @Req() req: any) {
        return this.videosService.getVideos(
            studentId,
            query
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
