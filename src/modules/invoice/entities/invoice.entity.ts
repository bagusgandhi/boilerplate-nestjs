import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';

@Entity('invoice')
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order.invoices)
  order: Orders;

  @ManyToOne(() => User, (user) => user.invoices)
  user: User;

  @Column({ nullable: true })
  description: string;

  @Column('decimal')
  total: number;

  @Column({
    type: 'enum',
    enum: ['paid', 'pending', 'canceled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'enum', enum: ['renewal', 'new_order'] })
  type: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deleted_at: Date;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
}
