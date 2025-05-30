import { StepGroup } from 'src/modules/step-group/entities/step-group.entity';
import { Contract } from 'src/modules/contract/entities/contract.entity';
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
  UpdateDateColumn,
} from 'typeorm';
import { BusinessPermits } from 'src/modules/business_permits/entities/business-permits.entity';

@Entity('step_progress')
export class StepProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;
    
  @Column()
  slug: string;

  @ManyToMany(() => StepGroup, (stepGroup) => stepGroup.step_progresses)
  @JoinTable()
  step_groups: StepGroup[]

  @OneToMany(() => Contract, (contract) => contract.step_progress)
  contracts: Contract[];

  @OneToMany(() => BusinessPermits, (businessPermits) => businessPermits.step_progress)
  business_permits: BusinessPermits[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
