import { Module } from "@nestjs/common";
import { AcademicsController } from "./academics.controller";
import { AcademicsService } from "./academics.service";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Classroom } from "./entities/classroom.entity";
import { AcademicYear } from "./entities/academic-year.entity";
import{ User } from "../users/users.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Classroom, AcademicYear, User]), UsersModule],
    controllers: [AcademicsController],
    providers: [AcademicsService],
    exports: []
})
export class AcademicsModule {}