// users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, Index } from 'typeorm';
import { UserRole } from '../common/userRole.enum';
import { CURRENT_TIMESTAMP } from '../common/constants';
import { Exclude } from 'class-transformer';


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

  @CreateDateColumn({type: 'timestamp', default : ()=> CURRENT_TIMESTAMP})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp', default : ()=> CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP})
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

//   @OneToMany(() => Video, (video) => video.id)
//   video: Video[];
}