import { Maintenance } from 'src/modules/maintenance/entities/maintenance.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';

@Entity('flow')
export class Flow extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  position: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Flexible JSON object

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @OneToMany(() => Maintenance, (maintenance) => maintenance.flow)
  maintenances: Maintenance[]

}
