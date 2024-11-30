import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/modules/role/entities/role.entity';
import { MaintenanceLog } from 'src/modules/maintenance-log/entities/maintenance-log.entity';
import { HistoryActionLog } from 'src/modules/history-action-log/entities/history-action-log.entity';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => MaintenanceLog, (maintenanceLog) => maintenanceLog.user)
  maintenance_log: MaintenanceLog[]

  @OneToMany(() => HistoryActionLog, (historyActionLog) => historyActionLog.user)
  history_action_log: HistoryActionLog[]
}
