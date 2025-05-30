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
  import { BusinessPermits } from './business-permits.entity';
  import { StepProgress } from 'src/modules/step-progress/entities/step-progress.entity';
  
  @Entity('business_permits_history')
  export class BusinessPermitsHistory extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => BusinessPermits, businessPermits => businessPermits.business_permits_history, {
      onDelete: 'CASCADE', // or SET NULL if you want to preserve history
    })
    business_permits: BusinessPermits;
  
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
  
  