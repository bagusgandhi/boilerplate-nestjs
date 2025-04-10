import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Templates } from './entities/templates.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CategoriesService } from '../categories/categories.service';
import { TemplateCategory } from './entities/template-category.entity';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { TemplatePaginationDto } from './dto/template-pagination.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  constructor(
    @InjectRepository(Templates)
    private readonly templatesRepository: Repository<Templates>,
    private readonly categoryService: CategoriesService,
  ) {}

  async findAll(
    query: TemplatePaginationDto,
  ): Promise<{ data: Templates[]; total: number }> {
    try {
      const { page, limit, search, viewAll, categoryId } = query;
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.templatesRepository.createQueryBuilder('template');

      if (categoryId){
        queryBuilder
        .leftJoinAndSelect('template.templateCategories', 'templateCategories')
        .leftJoinAndSelect('templateCategories.category', 'category')
        .where('category.id = :categoryId', { categoryId });
      }

      if (search) {
        queryBuilder.where('template.title ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (!viewAll) {
        queryBuilder.limit(limit).offset(skip);
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Templates> {
    try {
      const template = await this.templatesRepository.findOne({
        where: { id },
        relations: {
          templateCategories: {
            category: true,
          },
        },
        select: {
          templateCategories: {
            id: true,
            category: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      return template;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async create(body: CreateTemplateDto): Promise<Templates> {
    try {
      if (body.categories) {
        // Check if all categories exist
        const categories = await Promise.all(
          body.categories.map((categoryId) =>
            this.categoryService.findOne(categoryId),
          ),
        );

        // If any category is undefined, it means it wasn't found
        if (categories.some((category) => !category)) {
          throw new HttpException('One or more category IDs not found', 400);
        }
      }

      // Use transaction to ensure data consistency
      const result = await this.templatesRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Create template
          const template = await transactionalEntityManager.save(
            Templates,
            body,
          );

          // Create template categories if provided
          if (body.categories) {
            const templateCategories = body.categories.map((categoryId) =>
              transactionalEntityManager.create(TemplateCategory, {
                template: template,
                category: { id: categoryId },
              }),
            );
            await transactionalEntityManager.save(
              TemplateCategory,
              templateCategories,
            );
          }

          return template;
        },
      );

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(id: string, body: CreateTemplateDto): Promise<Templates> {
    try {
      if (body.categories) {
        // Check if all categories exist
        const categories = await Promise.all(
          body.categories.map((categoryId) =>
            this.categoryService.findOne(categoryId),
          ),
        );

        // If any category is undefined, it means it wasn't found
        if (categories.some((category) => !category)) {
          throw new HttpException('One or more category IDs not found', 400);
        }
      }

      await this.templatesRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Update template
          const template = await transactionalEntityManager.update(
            Templates,
            id,
            body,
          );

          // Delete existing template categories
          await transactionalEntityManager.delete(TemplateCategory, {
            template: { id },
          });

          // Create new template categories if provided
          if (body.categories) {
            const templateCategories = body.categories.map((categoryId) =>
              transactionalEntityManager.create(TemplateCategory, {
                template: { id },
                category: { id: categoryId },
              }),
            );
            await transactionalEntityManager.save(
              TemplateCategory,
              templateCategories,
            );
          }

          return template;
        },
      );

      // Get the updated template with all relations
      const updatedTemplate = await this.templatesRepository.findOne({
        where: { id },
        relations: ['categories'],
      });

      return updatedTemplate;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const template = await this.findOne(id);
      await this.templatesRepository.remove(template);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
