import { User } from "src/modules/user/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Contract } from "./contract.entity";

export enum ContractApprovalType {
  SIGN = 'sign',
  PARAF = 'paraf',
}

@Entity('contract_approval')
export class ContractApproval extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ContractApprovalType })
  type: ContractApprovalType;

  @ManyToOne(() => User, (user) => user.contract_approvals, { onDelete: 'SET NULL' })
  user: User;

  @Column({ type: 'int', nullable: false })
  position: number;

  @Column({ type: 'bool', default: false })
  done: boolean;

  @ManyToOne(() => Contract, (contract) => contract.contract_approvals, { onDelete: 'SET NULL' })
  contract: Contract;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
