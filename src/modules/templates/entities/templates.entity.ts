import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { TemplateCategory } from './template-category.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';

@Entity('templates')
export class Templates extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @OneToMany(() => TemplateCategory, (tc) => tc.template)
  templateCategories: TemplateCategory[];

  @OneToMany(() => Orders, (order) => order.template)
  orders: Orders[];
}
