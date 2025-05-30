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
import { BusinessPermits } from 'src/modules/business-permits/entities/business-permits.entity';
import { CorporateDocuments } from 'src/modules/corporate-documents/entities/corporate-documents.entity';

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

  @OneToMany(() => CorporateDocuments, (corporateDocuments) => corporateDocuments.step_progress)
  corporate_documents: CorporateDocuments[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
