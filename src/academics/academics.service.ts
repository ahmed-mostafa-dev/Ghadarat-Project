import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateClassroomDto } from "./dtos/create-classroom.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Classroom } from "./entities/classroom.entity";
import { FindOptionsWhere, ILike, Not, Repository } from "typeorm";
import { AcademicYear } from "./entities/academic-year.entity";
import { CreateAcademicYearDto } from "./dtos/create-academic-year.dto";
import { QueryClassroomDto } from "./dtos/query-classroom.dto";
import { UpdateClassroomDto } from "./dtos/update-classroom.dto";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UpdateAcademicYearDto } from "./dtos/update-academic-year.dto";
import { AssignStudentsDto } from "./dtos/assign-students.dto";

@Injectable()
export class AcademicsService {
constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const savedClassroom = await this.classroomRepository.save(classroom);

    await this.bumpClassroomsVersion();
    return savedClassroom;
}else{
    throw new BadRequestException('Classroom already exists');
}

}

// new
public async assignStudentToClassroom(classroomId: string, body: AssignStudentsDto) {
  // 1. جلب الفصل + التحقق من وجود كل الطلاب المطلوبين في نفس اللحظة
  const [classroom, users] = await Promise.all([
    this.classroomRepository.findOne({ where: { id: classroomId } }), // تأكد من اسم الخاصية في DTO
    Promise.all(body.studentIds.map(id => this.usersService.getUserById(id)))
  ]);

  if (!classroom) throw new NotFoundException('Classroom not found');
  if (!users || users.length !== body.studentIds.length) {
    throw new NotFoundException('One or more students not found');
  }

  // 2. إضافة مصفوفة الطلاب كلها لجدول الربط في استعلام واحد
  try {
    await this.classroomRepository
      .createQueryBuilder()
      .relation(Classroom, 'users')
      .of(classroomId)
      .add(body.studentIds); // .add() بتقبل Array مباشرة!
  } catch (error: any) { // إضافة : any تحل خطأ error.code في TypeScript
    if (error?.code === '23505') {
      throw new ConflictException('One or more students are already assigned to this classroom');
    }
    throw error;
  }

  await this.bumpClassroomsVersion();

  return {
    message: 'Students assigned successfully',
    classroomId,
    studentIds: body.studentIds,
  };
}


public async getClassroom(filterDto: QueryClassroomDto) {
  const { search, gradeLevel, term, track, page = 1, limit = 10 } = filterDto;


  const version = (await this.cacheManager.get<number>('classrooms_version')) || 1;


  const cacheKey = `v${version}/classrooms/${search || ''}/${gradeLevel || ''}/${term || ''}/${track || ''}/${page}/${limit}`;

  
  const cachedResponse = await this.cacheManager.get<{
    data: Classroom[];
    meta: { total: number; page: number; limit: number; lastPage: number };
  }>(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  
  const where: FindOptionsWhere<Classroom> = {};
  if (search) where.name = ILike(`%${search}%`);
  if (gradeLevel) where.gradeLevel = gradeLevel;
  if (term) where.term = term;
  if (track) where.track = track;

  const [data, total] = await this.classroomRepository.findAndCount({
    where,
    relations: { academicYear: true },
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const response = {
    data,
    meta: {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    },
  };


  await this.cacheManager.set(cacheKey, response, 24 * 60 * 60 * 1000);

  return response;
}

public async getClassroomById(id: string){
  const cacheKey = `/classroom/${id}`;
  const cachedClassroom = await this.cacheManager.get<Classroom>(cacheKey);
  if(cachedClassroom) return cachedClassroom;

    const classroom = await this.classroomRepository.findOne({where: {id}});
    if(!classroom) throw new NotFoundException('Classroom not found');
    await this.cacheManager.set(cacheKey, classroom, 60 * 60 * 24 * 1000); 
    return classroom;
}
// new
public async getStudentsByClassroomId(classroomId: string) {
    const classroom = await this.classroomRepository.findOne({
      where: {id: classroomId}, 
      relations: {users: true},
      select: {users:
         {id: true,
           username: true, 
           name: true
          }
         }
    });
    if(!classroom) throw new NotFoundException('Classroom not found');
    return classroom.users;
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

     this.classroomRepository.merge(classroom, body);

     if (body.academicYearId) {
    classroom.academicYear = { id: body.academicYearId } as any;
  }

    try {
      const result = await this.classroomRepository.save(classroom);
      const { id: _, ...rest } = result;

      await this.cacheManager.del(`/classroom/${id}`);
      await this.bumpClassroomsVersion();
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

    await this.cacheManager.del(`/classroom/${id}`);
    await this.bumpClassroomsVersion();
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
const savedAcademicYear = await this.academicYearRepository.save(academicYear);
await this.cacheManager.del('/academic-year');
await this.cacheManager.set(`/academic-year/${savedAcademicYear.id}`, savedAcademicYear, 60 * 60 * 24 * 1000);
return savedAcademicYear;
}

public async getAllAcademicYears(name?: string, startDate?: Date, endDate?: Date){
const startStr = startDate ? new Date(startDate).toISOString() : '';
  const endStr = endDate ? new Date(endDate).toISOString() : '';
  const cacheKey = `academic-year/${name || ''}/${startStr}/${endStr}`;


  const cachedData = await this.cacheManager.get<AcademicYear[]>(cacheKey);
  if (cachedData) return cachedData;


  const where: FindOptionsWhere<AcademicYear> = {};
  if (name) where.name = name;
  if (startDate) where.startDate = startDate;
  if (endDate) where.endDate = endDate;

  const academicYears = await this.academicYearRepository.find({ where });


  await this.cacheManager.set(cacheKey, academicYears, 24 * 60 * 60 * 1000);

  return academicYears;
}


public async getAcademicYearById(id: string){
  const cacheKey = `/academic-year/${id}`;
  const cachedData = await this.cacheManager.get<AcademicYear>(cacheKey);
  if (cachedData) return cachedData;
  
    const academicYear = await this.academicYearRepository.findOne({where: {id}});
    if(!academicYear) throw new NotFoundException('Academic year not found');
    await this.cacheManager.set(cacheKey, academicYear, 24 * 60 * 60 * 1000);

    return academicYear;
}

public async updateAcademicYear(id: string, body: UpdateAcademicYearDto) {
  const academicYear = await this.getAcademicYearById(id);
  Object.assign(academicYear, body);
  const updatedAcademicYear = await this.academicYearRepository.save(academicYear);
  
  await this.cacheManager.del(`/academic-year/${id}`);

  await this.cacheManager.set(`/academic-year/${id}`, updatedAcademicYear, 24 * 60 * 60 * 1000);
  
  await this.bumpAcademicYearsVersion();
  return updatedAcademicYear;
}

public async deleteAcademicYear(id: string) {
  const academicYear = await this.getAcademicYearById(id);
  const result = await this.academicYearRepository.softRemove(academicYear);

  await this.cacheManager.del(`/academic-year/${id}`);

  await this.bumpAcademicYearsVersion();

  return {
    name: result.name,
    message: 'Academic year deleted successfully',
  };
}



private async bumpClassroomsVersion(): Promise<void> {
  const currentVersion = (await this.cacheManager.get<number>('classrooms_version')) || 1;
  await this.cacheManager.set('classrooms_version', currentVersion + 1);
}


private async bumpAcademicYearsVersion(): Promise<void> {
  const currentVersion = (await this.cacheManager.get<number>('academic_years_version')) || 1;
  await this.cacheManager.set('academic_years_version', currentVersion + 1);
}


}