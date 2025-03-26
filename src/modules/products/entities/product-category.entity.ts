import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Products } from './products.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';

@Entity('product_category')
export class ProductCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Products, (product) => product.productCategories)
  product: Products;

  @ManyToOne(() => Categories, (category) => category.productCategories)
  category: Categories;
}
