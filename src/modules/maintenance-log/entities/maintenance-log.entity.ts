import { AssetType, BogieType } from 'src/modules/asset/dto/create-update-asset.dto';
import { Asset } from 'src/modules/asset/entities/asset.entity';
import { Flow } from 'src/modules/flow/entities/flow.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('maintenance_log')
export class MaintenanceLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'jsonb', nullable: true })
  paramsValue: Record<string, any>; // Flexible JSON object

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Flexible JSON object

  @ManyToOne(() => Asset, (asset) => asset.maintenance) // specify inverse side as a second parameter
  parent_asset: Asset

  @ManyToOne(() => Asset, (asset) => asset.maintenance) // specify inverse side as a second parameter
  asset: Asset

  @ManyToOne(() => Asset, (asset) => asset.maintenance) // Nullable foreign key referencing Asset
  gerbong_asset: Asset;

  @ManyToOne(() => Flow, (flow) => flow.maintenances)
  flow: Flow

  @ManyToOne(() => User, (user) => user.maintenance_log)
  user: User

  @Column({ nullable: true })
  program: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
