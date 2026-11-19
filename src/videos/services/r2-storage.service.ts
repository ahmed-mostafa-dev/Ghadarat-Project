import { Injectable } from "@nestjs/common";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";

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

    public async generateVideoUrl( fileKey: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ContentType: contentType
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    }


    public async getGeneratedVideoUrl(fileKey: string): Promise<string> {
       const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
       });
       return getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    }


    public async deleteVideo(fileKey: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });
        await this.s3Client.send(command);
    }
}
