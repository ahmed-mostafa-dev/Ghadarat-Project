import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";


const ALLOWED_VIDEO_TYPES: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
};

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const UPLOAD_URL_TTL_SECONDS = 300;   // 5 دقايق للرفع
const PLAYBACK_URL_TTL_SECONDS = 900; // 15 دقيقة للمشاهدة

// export interface UploadTarget {
//     key: string;
//     uploadUrl: string;
//     expiresInSeconds: number;
// }

@Injectable()
export class R2StorageService {
    private readonly bucketName: string;
    private readonly s3Client: S3Client;
    private readonly logger = new Logger(R2StorageService.name);
    constructor(
        private readonly configService: ConfigService
    ) {
        this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: this.configService.getOrThrow<string>('R2_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>('SECRET_ACCESS_KEY'),
            },
        });
    }

    public async buildVideoKey( fileKey: string, contentType: string): Promise<string> {
        const ext = ALLOWED_VIDEO_TYPES[contentType];
        if (!ext){ 
            throw new BadRequestException('صيغة الفيديو غير مدعومة');
        }
        return `${this.configService.getOrThrow<string>('R2_ENDPOINT')}/${this.bucketName}/${fileKey}/${uuidv4()}.${ext}`;
    }
    
    private async createVideoUploadUrl(fileKey: string, contentType: string, sizeBytes: number): Promise<string> {
        if (!ALLOWED_VIDEO_TYPES[contentType]) {
            throw new BadRequestException("صيغة الفيديو غير مدعومة");
        }
        if (!Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_VIDEO_SIZE_BYTES) {
            throw new BadRequestException("حجم الفيديو غير مسموح به");
        }

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ContentType: contentType,
            ContentLength: sizeBytes,
        });

        try {
            return await getSignedUrl(this.s3Client, command, {
                expiresIn: UPLOAD_URL_TTL_SECONDS,
            });
        } catch (error) {
            this.logger.error(`Failed to create upload URL for ${fileKey}`, error as Error);
            throw new InternalServerErrorException("تعذر إنشاء رابط رفع الفيديو");
        }
    }


    public async getGeneratedVideoUrl(fileKey: string): Promise<string> {
       const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
       });

      try {
            return await getSignedUrl(this.s3Client, command, {
                expiresIn: PLAYBACK_URL_TTL_SECONDS,
            });
        } catch (error) {
            this.logger.error(`Failed to create playback URL for ${fileKey}`, error as Error);
            throw new InternalServerErrorException("تعذر إنشاء رابط مشاهدة الفيديو");
        }
    }


    public async deleteVideo(fileKey: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });
        await this.s3Client.send(command);
    }
}
function uuidv4() {
    throw new Error("Function not implemented.");
}

