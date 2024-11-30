import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('history_action_log')
export class HistoryActionLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action_type: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>; // Flexible JSON object

  @ManyToOne(() => User, (user) => user.history_action_log)
  user: User

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
