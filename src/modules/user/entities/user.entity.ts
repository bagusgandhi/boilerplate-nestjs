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
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/modules/role/entities/role.entity';
import { Uploads } from 'src/modules/uploads/entities/uploads.entity';
import { Contract } from 'src/modules/contract/entities/contract.entity';
import { BusinessPermits } from 'src/modules/business-permits/entities/business-permits.entity';
import { CorporateDocuments } from 'src/modules/corporate-documents/entities/corporate-documents.entity';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Uploads, (upload) => upload.user, { cascade: true })
  uploads: Uploads[];

  @OneToMany(() => Contract, (contract) => contract.user, { onDelete: 'SET NULL' })
  contracts: Contract[];

  @OneToMany(() => BusinessPermits, (business_permits) => business_permits.user, { onDelete: 'SET NULL' })
  business_permits: BusinessPermits[];

  @OneToMany(() => CorporateDocuments, (corporate_documents) => corporate_documents.user, { onDelete: 'SET NULL' })
  corporate_documents: CorporateDocuments[];

  @Column({ nullable: false, default: 'basic' })
  provider: string;

  @Column({ nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpires: Date | null;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;
}
