import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';

@Entity('products')
export class Products extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'enum', enum: [6, 12, 24, 36] })
  duration: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  // cascade: true
  @OneToMany(() => ProductCategory, (pc) => pc.product, { cascade: true })
  productCategories: ProductCategory[];

  @OneToMany(() => Orders, (order) => order.product, {
    onDelete: 'SET NULL',
  })
  orders: Orders[];
}
