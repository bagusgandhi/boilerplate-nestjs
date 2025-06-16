import { StepProgress } from "src/modules/step-progress/entities/step-progress.entity";
import { Uploads } from "src/modules/uploads/entities/uploads.entity";
import { User } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BusinessPermitsHistory } from "./business-permits-history.entity";

@Entity('business_permits')
export class BusinessPermits extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;
  
    @Column()
    business_permits_number: string;
  
    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true, type: 'timestamptz' })
    start_date?: Date;

    @Column({ nullable: true, type: 'timestamptz' })
    reminder_date?: Date;
  
    @Column({ nullable: true, type: 'timestamptz' })
    end_date?: Date;

    @Column({ nullable: true, type: 'text' })
    notes?: string;

    @ManyToOne(() => StepProgress, (stepProgress) => stepProgress.business_permits, { 
        onDelete: 'SET NULL',
        nullable: true 
      })
    step_progress: StepProgress;

    @OneToMany(() => Uploads, (upload) => upload.business_permits, { onDelete: 'SET NULL'})
    uploads: Uploads[];

    @ManyToOne(() => User, (user) => user.business_permits, { onDelete: 'SET NULL' })
    user: User;

    @OneToMany(() => BusinessPermitsHistory, history => history.business_permits, {
      cascade: true,
      eager: true, // optional, loads history automatically
    })
    business_permits_history: BusinessPermitsHistory[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
  
    @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;
}
