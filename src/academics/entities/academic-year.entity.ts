import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, Index } from "typeorm";
import { Classroom } from "./classroom.entity";


@Entity('academic_years')
@Index(['name'], { unique: true, where: '"deletedAt" IS NULL' })
export class AcademicYear  {
 @PrimaryGeneratedColumn('uuid')   
 id: string;
 
 @Column({type: 'varchar', length: 50})
 name: string;

 @Column({type: 'date', nullable: true})
 startDate: string | Date | null;

 @Column({type: 'date', nullable: true})
 endDate: string | Date | null;
 
 @Column({type: 'boolean', default: true})
 isActive: boolean;

 @OneToMany(() => Classroom, classroom => classroom.academicYear)
 classrooms: Classroom[];
 
 @CreateDateColumn({type: 'timestamptz'})
 createdAt: Date;
 
 @UpdateDateColumn({type: 'timestamptz'})
 updatedAt: Date;
 
 @DeleteDateColumn({type: 'timestamptz', nullable: true})
 deletedAt: Date | null;
}