import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  Unique,
} from 'typeorm';
import { Orders } from 'src/modules/orders/entities/orders.entity';

@Entity('domain')
@Unique(['title'])
export class Domain extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal')
  amount: number;

  @OneToMany(() => Orders, (order) => order.domain)
  orders: Orders[];
}
