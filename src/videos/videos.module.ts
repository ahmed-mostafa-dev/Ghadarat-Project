import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./services/videos.service";
import { R2StorageService } from "./services/r2-storage.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Video } from "./entities/video.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    controllers: [VideosController],
    providers: [VideosService, R2StorageService],
    exports: [],
})
export class VideosModule {}