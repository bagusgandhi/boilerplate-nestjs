import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Templates } from './templates.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';

@Entity('template_category')
export class TemplateCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Templates, (template) => template.templateCategories, {
    onDelete: 'SET NULL',
  })
  template: Templates;

  @ManyToOne(() => Categories, (category) => category.templateCategories)
  category: Categories;
}
