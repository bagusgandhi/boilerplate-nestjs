import { BusinessPermits } from 'src/modules/business-permits/entities/business-permits.entity';
import { Contract } from 'src/modules/contract/entities/contract.entity';
import { CorporateDocuments } from 'src/modules/corporate-documents/entities/corporate-documents.entity';
import { User } from 'src/modules/user/entities/user.entity';
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

@Entity('uploads')
export class Uploads extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ nullable: true, type: 'bigint'})
  size?: number;

  @Column({ nullable: true })
  path?: string;

  @ManyToOne(() => Contract, (contract) => contract.uploads, { onDelete: 'SET NULL' })
  contract: Contract;

  @ManyToOne(() => BusinessPermits, (businessPermits) => businessPermits.uploads, { onDelete: 'SET NULL' })
  business_permits: BusinessPermits;

  @ManyToOne(() => CorporateDocuments, (corporateDocuments) => corporateDocuments.uploads, { onDelete: 'SET NULL' })
  corporate_documents: CorporateDocuments;

  @ManyToOne(() => User, (user) => user.uploads, { onDelete: 'SET NULL' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
