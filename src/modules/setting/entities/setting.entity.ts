import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, Column } from 'typeorm';

@Entity('setting')
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column("int", { array: true, nullable: true})
  reminder_days_before?: number[];

  @Column("simple-array", { nullable: true })
  userIds?: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
