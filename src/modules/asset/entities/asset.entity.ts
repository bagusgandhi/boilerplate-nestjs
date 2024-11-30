import { Maintenance } from 'src/modules/maintenance/entities/maintenance.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType, BogieType, CarriageType } from '../dto/create-update-asset.dto';

@Entity('asset')
export class Asset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  alias: string;

  @Column({ nullable: true })
  description: string;

  @Index()
  @Column({ unique: true, nullable: true })
  rfid: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['Train Set', 'Gerbong', 'Keping Roda', 'Bogie'],
  })
  asset_type: AssetType;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4'],
    nullable: true
  })
  bogie: BogieType;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['active', 'not feasible', 'inactive'],
    nullable: true
  })
  status: 'active' | 'not feasible' | 'inactive';

  @Column({ type: 'jsonb', nullable: true })
  paramsValue: Record<string, any>; // Flexible JSON object

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['GT', 'GB'],
    nullable: true,
  })
  carriage_type: CarriageType;

  @Column({ nullable: true })
  factory: string;

  @Column({ nullable: true })
  carriage_number: string;

  @ManyToOne(() => Asset, (asset) => asset.children, { onDelete: 'SET NULL' })
  parent_asset: Asset;

  @OneToMany(() => Asset, (asset) => asset.parent_asset)
  children: Asset[];

  @OneToOne(() => Maintenance, (maintenance) => maintenance.asset) // specify inverse side as a second parameter
  @JoinColumn()
  maintenance: Maintenance;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
