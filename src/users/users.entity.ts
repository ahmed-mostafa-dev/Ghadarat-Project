// users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,  DeleteDateColumn, Index, ManyToOne } from 'typeorm';
import { UserRole } from '../common/userRole.enum';
import { CURRENT_TIMESTAMP } from '../common/constants';
import { Exclude } from 'class-transformer';
import { Classroom } from '../academics/entities/classroom.entity';


@Entity('users')
@Index(['name', 'role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 150 })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT})
  role: UserRole;

  @Exclude()
  @Column({type: 'varchar', nullable: true})
  password: string;

  @CreateDateColumn({type: 'timestamptz', default : ()=> CURRENT_TIMESTAMP})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamptz', default : ()=> CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP})
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Classroom, (classroom) => classroom.users, { nullable: true })
  classroom: Classroom;
//   @OneToMany(() => Video, (video) => video.id)
//   video: Video[];
}

// autocannon -m POST -H "Content-Type: application/json" -b '{"username": "احمد كمال البحيري","password":"123456"}' -c 170 -d 30 http://localhost:2000/auth/login