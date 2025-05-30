import { StepProgress } from "src/modules/step-progress/entities/step-progress.entity";
import { Uploads } from "src/modules/uploads/entities/uploads.entity";
import { User } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CorporateDocumentsHistory } from "./corporate-documents-history.entity";

@Entity('corporate_documents')
export class CorporateDocuments extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;
  
    @Column()
    corporate_documents_number: string;
  
    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true, type: 'timestamptz' })
    start_date?: Date;
  
    @Column({ nullable: true, type: 'timestamptz' })
    end_date?: Date;

    @Column({ nullable: true, type: 'text' })
    notes?: string;

    @ManyToOne(() => StepProgress, (stepProgress) => stepProgress.business_permits, { 
        onDelete: 'SET NULL',
        nullable: true 
      })
    step_progress: StepProgress;

    @OneToMany(() => Uploads, (upload) => upload.corporate_documents, { onDelete: 'SET NULL'})
    uploads: Uploads[];

    @ManyToOne(() => User, (user) => user.business_permits, { onDelete: 'SET NULL' })
    user: User;

    @OneToMany(() => CorporateDocumentsHistory, history => history.corporate_documents, {
      cascade: true,
      eager: true, // optional, loads history automatically
    })
    corporate_documents_history: CorporateDocumentsHistory[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
  
    @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;
}
