import { StepProgress } from "src/modules/step-progress/entities/step-progress.entity";
import { Uploads } from "src/modules/uploads/entities/uploads.entity";
import { User } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('notifications')
export class Notifications extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    subject: string;

    @Column({ type: 'text', nullable: true })
    text?: string;

    @ManyToOne(() => User, (user) => user.corporate_documents, { onDelete: 'SET NULL' })
    user: User;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
  
    @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;
}
