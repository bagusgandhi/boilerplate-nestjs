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
import { Contract } from './contract.entity';
import { StepProgress } from 'src/modules/step-progress/entities/step-progress.entity';

@Entity('contract_history')
export class ContractHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contract, contract => contract.contract_history, {
    onDelete: 'CASCADE', // or SET NULL if you want to preserve history
  })
  contract: Contract;

  @ManyToOne(() => StepProgress, { onDelete: 'CASCADE' })
  step_progress: StepProgress;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}

