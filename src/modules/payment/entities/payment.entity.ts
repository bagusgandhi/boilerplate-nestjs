import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from 'src/modules/invoice/entities/invoice.entity';
@Entity('payment')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  invoice: Invoice;

  @Column({ type: 'jsonb' })
  transaction_details: any;

  @Column({ type: 'decimal' })
  amount: number;
}
