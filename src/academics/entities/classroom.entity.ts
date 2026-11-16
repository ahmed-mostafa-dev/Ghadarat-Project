import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GradeLevel } from "../enums/grade-level.enum";
import { Track } from "../enums/track.enum";
import { Term } from "../enums/term.enum";
import { User } from "../../users/users.entity";
import { AcademicYear } from "./academic-year.entity";


@Entity('classrooms')
@Index(['academicYearId', 'gradeLevel', 'term', 'track','name'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class Classroom {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ type: 'varchar', length: 50 })
name: string;


@Column({ type: 'enum', enumName: 'grade_level_enum', enum: GradeLevel })
gradeLevel: GradeLevel;


@Column({ type: 'enum', enumName: 'track_enum', enum: Track})
track: Track;


@Column({type: 'enum',enumName: 'term_enum', enum: Term})
term: Term;


@Column({type: 'uuid', name: 'academicYearId' })
academicYearId: string;

@ManyToOne(()=> AcademicYear, (academicYear) => academicYear.classrooms, {
  nullable: false,
  onDelete: 'RESTRICT',
})
@JoinColumn({name: 'academicYearId'})
academicYear: AcademicYear;

@OneToMany(() => User, (user) => user.classroom)
users: User[];

@CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

@UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

@DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}