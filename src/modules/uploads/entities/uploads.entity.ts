import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('uploads')
export class Uploads extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ nullable: true, type: 'bigint'})
  size?: number;

  @Column({ nullable: true })
  path?: string;

  @ManyToOne(() => User, (user) => user.uploads, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
