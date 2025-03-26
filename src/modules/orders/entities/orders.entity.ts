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
import { Products } from 'src/modules/products/entities/products.entity';
import { Promo } from 'src/modules/promo/entities/promo.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Domain } from 'src/modules/domain/entities/domain.entity';
import { Invoice } from 'src/modules/invoice/entities/invoice.entity';
import { Templates } from 'src/modules/templates/entities/templates.entity';
import { Site } from 'src/modules/sites/entities/site.entity';

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

  @ManyToOne(() => Products, (product) => product.orders)
  product: Products;

  @ManyToOne(() => Domain, (domain) => domain.orders)
  domain: Domain;

  @ManyToOne(() => Promo, { nullable: true, eager: true })
  promo?: Promo;

  @ManyToOne(() => Templates, (template) => template.orders, { nullable: true })
  template: Templates | null;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ nullable: true })
  domain_name: string;

  @Column({ nullable: true })
  description: string;

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

  @OneToOne(() => Site, (site) => site.order)
  site: Site;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    const productAmount = Number(this.product?.amount) || 0;
    const domainAmount = Number(this.domain?.amount) || 0;
    const promoDiscount = Number(this.promo?.amount) || 0;
    this.total = domainAmount + productAmount - promoDiscount;
  }
}
