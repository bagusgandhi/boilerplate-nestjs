import { StepProgress } from 'src/modules/step-progress/entities/step-progress.entity';
import { Uploads } from 'src/modules/uploads/entities/uploads.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractHistory } from './contract-history.entity';

@Entity('contract')
export class Contract extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  contract_number: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  scopes?: string;

  @Column({ nullable: true, type: 'timestamptz' })
  start_date?: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  end_date?: Date;

  @Column({ nullable: true })
  mitra_name?: string;

  @Column({ nullable: true, type: 'text' })
  mitra_address?: string;

  @Column({ nullable: true })
  mitra_npwp?: string;

  @Column({ nullable: true })
  mitra_siup?: string;

  @Column({ nullable: true })
  mitra_no_nib_rba?: string;

  @Column({ nullable: true })
  representative_name?: string;

  @Column({ nullable: true })
  representative_position?: string;

  @Column({ nullable: true })
  representative_identity?: string;

  @Column({ nullable: true })
  representative_authority_detail?: string;

  @Column({ nullable: true })
  bank_name?: string;

  @Column({ nullable: true })
  bank_branch?: string;

  @Column({ nullable: true })
  bank_account_number?: string;

  @Column({ nullable: true })
  bank_account_name?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true })
  service_provided?: string;

  @Column({ nullable: true, type: 'bigint' })
  costs?: number;

  @Column({ nullable: true, type: 'text' })
  payment_and_taxes?: string;

  @ManyToOne(() => StepProgress, (stepProgress) => stepProgress.contracts, { 
    onDelete: 'SET NULL',
    nullable: true 
  })
  step_progress: StepProgress;

  @OneToMany(() => Uploads, (upload) => upload.contract, { onDelete: 'SET NULL'})
  uploads: Uploads[];

  @ManyToOne(() => User, (user) => user.contracts, { onDelete: 'SET NULL' })
  user: User;

  @OneToMany(() => ContractHistory, history => history.contract, {
    cascade: true,
    eager: true, // optional, loads history automatically
  })
  contract_history: ContractHistory[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
