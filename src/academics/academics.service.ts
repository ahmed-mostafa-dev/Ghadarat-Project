import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateClassroomDto } from "./dtos/create-classroom.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Classroom } from "./entities/classroom.entity";
import { FindOptionsWhere, ILike, Not, Repository } from "typeorm";
import { AcademicYear } from "./entities/academic-year.entity";
import { CreateAcademicYearDto } from "./dtos/create-academic-year.dto";
import { QueryClassroomDto } from "./dtos/query-classroom.dto";
import { UpdateClassroomDto } from "./dtos/update-classroom.dto";


@Injectable()
export class AcademicsService {
constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly usersService: UsersService,

) {}
    
public async createClassroom(body:CreateClassroomDto, userId:string){
const user = await this.usersService.getUserById(userId);
if(!user) throw new NotFoundException();

await this.getAcademicYearById(body.academicYearId);

const existingClassroom = await this.classroomRepository.findOne({
    where: {
        name: body.name,
        gradeLevel: body.gradeLevel,
        term: body.term,
        track: body.track,
        academicYear: { id: body.academicYearId }
    }
});
if(!existingClassroom) {
    const classroom = this.classroomRepository.create({
        ...body,
        users:[user]
    });
    return this.classroomRepository.save(classroom);
}else{
    throw new BadRequestException('Classroom already exists');
}

}

public async getClassroom(filterDto: QueryClassroomDto){
const {search, gradeLevel, term, track, page = 1, limit = 10} = filterDto
const where: FindOptionsWhere<Classroom> = {}
if (search) where.name = ILike(`%${search}%`)
if (gradeLevel) where.gradeLevel = gradeLevel
if (term) where.term = term
if (track) where.track = track
const [data , total] = await this.classroomRepository.findAndCount({
    where,
    relations: {academicYear : true},
    order: { createdAt : 'DESC'},
    skip: (page - 1) * limit,
    take: limit
}) 
 return {data,
     meta: {
        total,
         page,
          limit,
           lastPage: Math.ceil(total / limit)
     }
 }
}

public async getClassroomById(id: string){
    const classroom = await this.classroomRepository.findOne({where: {id}});
    if(!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
}

public async updateClassroom(id: string, body: UpdateClassroomDto) {

    const classroom = await this.getClassroomById(id);

    const isConflictFieldChanged =
      (body.name !== undefined && body.name !== classroom.name) ||
      (body.gradeLevel !== undefined && body.gradeLevel !== classroom.gradeLevel) ||
      (body.term !== undefined && body.term !== classroom.term) ||
      (body.track !== undefined && body.track !== classroom.track) ||
      (body.academicYearId !== undefined && body.academicYearId !== classroom.academicYearId);

    if (isConflictFieldChanged) {
      const isDuplicate = await this.classroomRepository.findOne({
        where: {
          id: Not(id),
          name: body.name ?? classroom.name,
          gradeLevel: body.gradeLevel ?? classroom.gradeLevel,
          term: body.term ?? classroom.term,
          track: body.track ?? classroom.track,
          academicYearId: body.academicYearId ?? classroom.academicYearId,
        },
        select: { id: true }, 
      });

      if (isDuplicate) {
        throw new ConflictException(
          'A classroom with the same name, grade level, term, and track already exists for this academic year',
        );
      }
    }

    const updatedClassroom = this.classroomRepository.merge(classroom, body);

    try {
      const result = await this.classroomRepository.save(updatedClassroom);
      const { id: _, ...rest } = result;

      return {
        ...rest,
        message: 'Classroom updated successfully',
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          'A classroom with the same name, grade level, term, and track already exists for this academic year',
        );
      }
      throw error;
    }
  }

public async deleteClassroom(id: string){
    const classroom = await this.getClassroomById(id);
    const result = await this.classroomRepository.softRemove(classroom);
    return {
        name: result.name,
        message: "Classroom deleted successfully"
    };
}


//================================================================
// Academic Year Methods
public async createAcademicYear(body:CreateAcademicYearDto){
const academicYearExists = await this.academicYearRepository.findOne({where: {name: body.name}});
if(academicYearExists) throw new BadRequestException('Academic year already exists');
const academicYear = this.academicYearRepository.create(body);
return this.academicYearRepository.save(academicYear);
}

public async getAllAcademicYears(name?: string, startDate?: Date, endDate?: Date){
    const where: FindOptionsWhere<AcademicYear> = {};
    if (name) where.name = name;
    if (startDate) where.startDate = startDate;
    if (endDate) where.endDate = endDate;
return await this.academicYearRepository.find({where});
}


public async getAcademicYearById(id: string){
    const academicYear = await this.academicYearRepository.findOne({where: {id}});
    if(!academicYear) throw new NotFoundException('Academic year not found');
    return academicYear;
}

public async updateAcademicYear(id: string, body: CreateAcademicYearDto){
    const academicYear = await this.getAcademicYearById(id);
    Object.assign(academicYear, body);
    return this.academicYearRepository.save(academicYear);
}

public async deleteAcademicYear(id: string){
    const academicYear = await this.getAcademicYearById(id);
    const result = await this.academicYearRepository.softRemove(academicYear);
    return {
        name: result.name,
        message: "Academic year deleted successfully"
    };
}

}