// users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,  DeleteDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../common/userRole.enum';
import { CURRENT_TIMESTAMP } from '../common/constants';
import { Exclude } from 'class-transformer';
import { Classroom } from '../academics/entities/classroom.entity';


@Entity('users')
@Index(['role', 'classroomId']) 
@Index(['username'], { unique: true, where: '"deleted_at" IS NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar',length: 150 })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT})
  role: UserRole;

  @Exclude()
  @Column({type: 'varchar', nullable: true, select: false})
  password: string;

  @Column({ type: 'uuid', nullable: true })
  classroomId: string;

  @ManyToOne(() => Classroom, (classroom) => classroom.users, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'classroomId' })
  classroom: Classroom;

  @Column({ default: true })
  isActive: boolean;
  
  //   @OneToMany(() => Video, (video) => video.id)
  // video: Video[];

  @CreateDateColumn({type: 'timestamptz', default : ()=> CURRENT_TIMESTAMP})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamptz', default : ()=> CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP})
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

}

