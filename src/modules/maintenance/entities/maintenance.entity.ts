import { Asset } from 'src/modules/asset/entities/asset.entity';
import { Flow } from 'src/modules/flow/entities/flow.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('maintenance')
export class Maintenance extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Asset, (asset) => asset.maintenance) // specify inverse side as a second parameter
  asset: Asset

  @ManyToOne(() => Flow, (flow) => flow.maintenances)
  flow: Flow

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @Column({ nullable: true })
  program: string;

  @Column({type: 'varchar', nullable: true })
  wo_number: string;

  @Column({ default: false })
  is_maintenance: boolean;
}
