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
  import { CorporateDocuments } from './corporate-documents.entity';
  import { StepProgress } from 'src/modules/step-progress/entities/step-progress.entity';
  
  @Entity('corporate_documents_history')
  export class CorporateDocumentsHistory extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => CorporateDocuments, corporateDocuments => corporateDocuments.corporate_documents_history, {
      onDelete: 'CASCADE', // or SET NULL if you want to preserve history
    })
    corporate_documents: CorporateDocuments;
  
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
  
  