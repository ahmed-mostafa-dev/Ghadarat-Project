import { Injectable, BadRequestException } from "@nestjs/common";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from 'uuid';



const UPLOAD_EXPIRATION_URL = 300;
const PLAYBACK_EXPIRATION_URL = 900;

const VIDEO_MIME_TYPES: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm'
};

@Injectable()
export class R2StorageService {
    private readonly bucketName: string;
    private readonly s3Client: S3Client;

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

    // Generate Upload URL
    public async generateUploadUrl( fileKey: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ContentType: contentType
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: UPLOAD_EXPIRATION_URL });
    }


    // Generate Playback URL
    public async generatePlaybackUrl(fileKey: string): Promise<string> {
       const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
       });
       return getSignedUrl(this.s3Client, command, { expiresIn: PLAYBACK_EXPIRATION_URL });
    }


    // Delete Video
    public async deleteVideo(fileKey: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });
        await this.s3Client.send(command);
    }

    //Video Key Generator
    public generateVideoKey(contentType: string): string {
         const extensions = VIDEO_MIME_TYPES[contentType];

    if (!extensions) {
        throw new BadRequestException('صيغة الفيديو غير مدعومة');
    }
    return `videos/${uuidv4()}.${extensions}`;
    }
}
