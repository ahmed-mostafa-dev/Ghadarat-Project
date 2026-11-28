import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { R2StorageService } from "./r2-storage.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Video } from "../entities/video.entity";
import { Repository } from "typeorm";
import { VideoStatus } from "../enums/video-status.enum";
import { UserRole } from "../../common/userRole.enum";
import { QueryVideosDto } from "../dtos/query-videos.dto";
import { MAX_VIDEO_SIZE } from "../../common/constants";
import { User } from "../../users/users.entity";


export interface RequestUploadInput {
  studentId: string;
  competencyName: string;
  title: string;
  fileSize: number;
  contentType: string;
}



@Injectable()
export class VideosService {
    private readonly logger = new Logger(VideosService.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Video)
        private readonly videosRepository: Repository<Video>,
        private readonly r2StorageService: R2StorageService,
    ) {}
    
    // Request upload endpoint
    public async requestUpload(input: RequestUploadInput) {
    
    const student = await this.usersRepository.findOne({ 
      where: {id: input.studentId},
      select: {id: true, classroomId: true},
    })

    if (!student?.classroomId) {
      throw new BadRequestException('لازم تكون مسجل في فصل قبل رفع الفيديو');
    }
    
    const fileKey = this.r2StorageService.generateVideoKey(input.contentType);     
    const uploadUrl = await this.r2StorageService.generateUploadUrl(
      fileKey,
      input.contentType,
      input.fileSize,
    );
    const video = this.videosRepository.create({
      studentId: input.studentId,
      classroomId: student.classroomId,
      competencyName: input.competencyName,
      title: input.title,
      fileKey,
      fileSize: input.fileSize,
      status: VideoStatus.PENDING,
    });

       const savedVideo = await this.videosRepository.save(video);

    return {
      videoId: savedVideo.id,
      fileKey: savedVideo.fileKey,
      uploadUrl,
    };

    }

    // Mark as uploaded endpoint
    public async markAsUploaded(videoId: string, studentId: string): Promise<Video> {
    const video = await this.findOwnedVideoOrFail(videoId, studentId);
    if (video.status !== VideoStatus.PENDING) {
      throw new BadRequestException('الفيديو تم رفعه مسبقا');
    }
    const size = await this.r2StorageService.getObjectSize(video.fileKey); 
    if (size === null) { 
      throw new BadRequestException('فشل في التحقق من حجم الملف');
    }
    if(size > MAX_VIDEO_SIZE) {
      await this.r2StorageService.deleteVideo(video.fileKey);
      await this.videosRepository.softRemove(video);
      throw new BadRequestException('حجم الفيديو يتجاوز الحد المسموح به');
    }

    video.fileSize = size;
    video.status = VideoStatus.READY; 
    return this.videosRepository.save(video);
    }

    // Get playback URL endpoint
    public async getPlaybackUrl(videoId: string, requesterId: string, requesterRole: UserRole): Promise<{ playbackUrl: string; video: Video }> {
    const video = await this.findVideoOrFail(videoId);

    if (video.studentId !== requesterId &&
        ![UserRole.ADMIN, UserRole.VERIFIER, UserRole.ASSESSOR].includes(requesterRole)
        ) {
      throw new ForbiddenException(
        'غير مسموح لك بمشاهدة هذا الفيديو',
      );
    }

    const playbackUrl = await this.r2StorageService.generatePlaybackUrl(
      video.fileKey,
    );

    return { playbackUrl, video };
    }

    // Remove video endpoint
    public async removeVideo(videoId: string, requesterId: string, requesterRole: UserRole): Promise<{ deleted: boolean }> {
    const video = await this.findVideoOrFail(videoId);

    if (video.studentId !== requesterId &&  ![UserRole.ADMIN, UserRole.VERIFIER, UserRole.ASSESSOR].includes(requesterRole)) {
      throw new ForbiddenException('غير مسموح لك بحذف هذا الفيديو');
    }
    const fileKey = video.fileKey;

    await this.videosRepository.softRemove(video);

    try {
      await this.r2StorageService.deleteVideo(fileKey);
    } catch (error) {
      this.logger.warn(
        `تم حذف سجل الفيديو ${videoId} ولكن تعذر حذف الملف ${fileKey} من R2`,
        error instanceof Error ? error.stack : undefined,
      );
    }
    return { deleted: true };
    }

    // Get videos endpoint for student
    public async getVideos(studentId: string, query: QueryVideosDto) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const qb = this.videosRepository
      .createQueryBuilder('video')
      .where('video.studentId = :studentId', {
        studentId,
      });

      if (query.status) {
        qb.andWhere('video.status = :status', {
          status: query.status,
        });
      }

      qb
        .orderBy('video.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await qb.getManyAndCount();
      return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


    public async getVideosByOthers( requesterRole: UserRole, query: QueryVideosDto){
       
        if (![ UserRole.ADMIN,UserRole.VERIFIER,UserRole.ASSESSOR].includes(requesterRole)) {
    throw new ForbiddenException('غير مسموح لك بعرض الفيديوهات');
  }


     const page = query.page ?? 1;
     const limit = query.limit ?? 10;

     const qb = this.videosRepository.createQueryBuilder('video');

    const status = query.status ?? VideoStatus.READY;  
    qb.andWhere('video.status = :status', {
      status,
    });


     if (query.classroomId) qb.andWhere('video.classroomId = :c', { c: query.classroomId });
     
     if (query.studentId) qb.andWhere('video.studentId = :s', { s: query.studentId });
     qb
    .orderBy('video.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

     const [items, total] =
    await qb.getManyAndCount();

     return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
        };
  }


  private async findVideoOrFail(videoId: string): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('الفيديو غير موجود');
    }

    return video;
  }

  private async findOwnedVideoOrFail(
    videoId: string,
    studentId: string,
  ): Promise<Video> {
    const video = await this.findVideoOrFail(videoId);

    if (video.studentId !== studentId) {
      throw new ForbiddenException('هذا الفيديو لا يخص حسابك');
    }

    return video;
  }
}