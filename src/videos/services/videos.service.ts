import { Injectable } from "@nestjs/common";
import { R2StorageService } from "./r2-storage.service";

@Injectable()
export class VideosService {
    constructor(
        private readonly r2StorageService: R2StorageService
    ) {}
}