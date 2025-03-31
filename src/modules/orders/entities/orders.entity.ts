import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { Products } from '../../products/entities/products.entity';
import { Promo } from '../../promo/entities/promo.entity';
import { User } from '../../user/entities/user.entity';
import { Domain } from '../../domain/entities/domain.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Templates } from '../../templates/entities/templates.entity';
import { Site } from '../../sites/entities/site.entity';

export enum StatusOrder {
  ACTIVE = 'active',
  RENEWED = 'renewed',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  PENDING = 'pending',
}
@Entity('orders')
export class Orders extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Products, (product) => product.orders, {
    onDelete: 'SET NULL',
  })
  product: Products;

  @ManyToOne(() => Domain, (domain) => domain.orders)
  domain: Domain;

  @ManyToOne(() => Promo, { nullable: true, eager: true })
  promo?: Promo;

  @ManyToOne(() => Templates, (template) => template.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  template: Templates | null;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ nullable: true })
  domain_name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column('decimal')
  total: number;

  @Column({
    type: 'enum',
    enum: StatusOrder,
    default: 'pending',
  })
  status: StatusOrder;

  @Column({ type: 'timestamp', nullable: true })
  expired_date: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deleted_at: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices: Invoice[];

  @OneToOne(() => Site, (site) => site.order, { cascade: true })
  site: Site;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    const productAmount = Number(this.product?.amount) || 0;
    const domainAmount =
      Number(this.domain?.amount) * Number(this.product?.duration) || 0;
    const promoDiscount = Number(this.promo?.amount) || 0;
    this.total = domainAmount + productAmount - promoDiscount;
  }
}
