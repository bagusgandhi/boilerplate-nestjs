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
  Unique,
  BeforeInsert,
} from 'typeorm';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { StatusInvoice } from '../dto/update-invoice.dto';

@Entity('invoice')
@Unique(['invoice_number'])
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  invoice_number: string;

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
    enum: StatusInvoice,
    default: StatusInvoice.PENDING,
  })
  status: StatusInvoice;

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

  @BeforeInsert()
  generateInvoice() {
    // random number combination date and time, using momentjs
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    this.invoice_number = `INV-${formattedDate}-${randomNumber}`;
  }
}
