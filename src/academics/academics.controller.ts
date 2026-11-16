import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AcademicsService } from "./academics.service";
import { CreateClassroomDto } from "./dtos/create-classroom.dto";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import * as types from "../common/types";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateAcademicYearDto } from "./dtos/create-academic-year.dto";
import { QueryClassroomDto } from "./dtos/query-classroom.dto";
import { UpdateClassroomDto } from "./dtos/update-classroom.dto";

@Controller('academics')
export class AcademicsController {
    constructor(
        private readonly academicsService: AcademicsService
    ) {}
    
    @UseGuards(AuthGuard)
    @Post('classroom')
    public async createClassroom(@Body() body: CreateClassroomDto, @CurrentUser() payload: types.JWTUserPayload) {
        return this.academicsService.createClassroom(body, payload.sub);
    }

    @UseGuards(AuthGuard)
    @Get('classroom')
    public async getClassroom(@Query() dto: QueryClassroomDto){
        return this.academicsService.getClassroom(dto);
    }

    @UseGuards(AuthGuard)
    @Get('classroom/:id')
    public async getClassroomById(@Param('id') id: string){
        return this.academicsService.getClassroomById(id);
    }

    @UseGuards(AuthGuard)
    @Patch('classroom/:id')
    public async updateClassroom(@Param('id') id: string, @Body() body: UpdateClassroomDto){
        return this.academicsService.updateClassroom(id, body);
    }

    @UseGuards(AuthGuard)
    @Delete('classroom/:id')
    public async deleteClassroom(@Param('id') id: string){
        return this.academicsService.deleteClassroom(id);
    }

//===================================================================
    // Academic Year Routes
    @UseGuards(AuthGuard)
    @Post('academic-year')
    public async createAcademicYear(@Body() body: CreateAcademicYearDto) {
        return this.academicsService.createAcademicYear(body);
    }

    @UseGuards(AuthGuard)
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

    @UseGuards(AuthGuard)
    @Get('academic-year/:id')
    public async getAcademicYearById(@Param('id') id: string) {
        return this.academicsService.getAcademicYearById(id);
    }

    @UseGuards(AuthGuard)
    @Patch('academic-year/:id')
    public async updateAcademicYear(@Param('id') id: string, @Body() body: CreateAcademicYearDto) {
        return this.academicsService.updateAcademicYear(id, body);
    }

    @UseGuards(AuthGuard)
    @Delete('academic-year/:id')
    public async deleteAcademicYear(@Param('id') id: string) {
        return this.academicsService.deleteAcademicYear(id);
    }
}
