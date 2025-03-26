import { ProductCategory } from 'src/modules/products/entities/product-category.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  Unique,
} from 'typeorm';
import { TemplateCategory } from 'src/modules/templates/entities/template-category.entity';

@Entity('categories')
@Unique(['title'])
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ProductCategory, (pc) => pc.category)
  productCategories: ProductCategory[];

  @OneToMany(() => TemplateCategory, (tc) => tc.category)
  templateCategories: TemplateCategory[];
}
