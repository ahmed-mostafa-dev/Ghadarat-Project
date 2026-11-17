import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { AcademicsService } from "./academics.service";
import { CreateClassroomDto } from "./dtos/create-classroom.dto";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import * as types from "../common/types";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateAcademicYearDto } from "./dtos/create-academic-year.dto";
import { QueryClassroomDto } from "./dtos/query-classroom.dto";
import { UpdateClassroomDto } from "./dtos/update-classroom.dto";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { UpdateAcademicYearDto } from "./dtos/update-academic-year.dto";

@UseGuards(AuthGuard)
@Controller('academics')
export class AcademicsController {
    constructor(
        private readonly academicsService: AcademicsService
    ) {}
    
    //===================================================================
    // Classroom Routes
    //===================================================================
    @Post('classroom')
    public async createClassroom(@Body() body: CreateClassroomDto, @CurrentUser() payload: types.JWTUserPayload) {
        return this.academicsService.createClassroom(body, payload.sub);
    }


    @Get('classroom')
    public async getClassroom(@Query() dto: QueryClassroomDto){
        return this.academicsService.getClassroom(dto);
    }


    @Get('classroom/:id')
    public async getClassroomById(@Param('id', new ParseUUIDPipe()) id: string){
        return this.academicsService.getClassroomById(id);
    }

  
    @Patch('classroom/:id')
    public async updateClassroom(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateClassroomDto){
        return this.academicsService.updateClassroom(id, body);
    }


    @Delete('classroom/:id')
    public async deleteClassroom(@Param('id', new ParseUUIDPipe()) id: string){
        return this.academicsService.deleteClassroom(id);
    }

//===================================================================
    // Academic Year Routes
//===================================================================

    @Post('academic-year')
    public async createAcademicYear(@Body() body: CreateAcademicYearDto) {
        return this.academicsService.createAcademicYear(body);
    }


    @Get('academic-year')
    public async getAllAcademicYears(
        @Query('name') name?:string,
        @Query('startDate') startDate?:string,
        @Query('endDate') endDate?:string,
    ) {
       
        return this.academicsService.getAllAcademicYears(
            name,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
    }


    @Get('academic-year/:id')
    public async getAcademicYearById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.academicsService.getAcademicYearById(id);
    }


    @Patch('academic-year/:id')
    public async updateAcademicYear(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateAcademicYearDto) {
        return this.academicsService.updateAcademicYear(id, body);
    }


    @Delete('academic-year/:id')
    public async deleteAcademicYear(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.academicsService.deleteAcademicYear(id);
    }
}
