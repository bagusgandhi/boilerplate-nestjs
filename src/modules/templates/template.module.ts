import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Templates } from './entities/templates.entity';
import { TemplateCategory } from './entities/template-category.entity';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forFeature([Templates, TemplateCategory]),
  ],
  providers: [TemplatesService],
  exports: [TemplatesService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
