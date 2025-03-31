import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Orders } from 'src/modules/orders/entities/orders.entity';

@Entity('sites')
@Index(['cloudflare_zone_id', 'db_name', 'port'], { unique: true })
export class Site extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cloudflare_zone_id: string;

  @Column()
  db_name: string;

  @Column()
  db_user: string;

  @Column()
  db_password: string;

  @Column('int')
  port: number;

  @Column({
    type: 'enum',
    enum: ['active', 'on progress', 'expired'],
    default: 'on progress',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deleted_at: Date;

  @OneToOne(() => Orders, (order) => order.site)
  @JoinColumn({ name: 'order_id' })
  order: Orders;
}
