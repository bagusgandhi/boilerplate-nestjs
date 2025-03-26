import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepository: Repository<Categories>,
  ) {}

  async findAll(): Promise<Categories[]> {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Categories> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      return category;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async create(body: CreateCategoryDto): Promise<Categories> {
    try {
      const category = await this.categoryRepository.save(body);
      return category;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(id: string, body: CreateCategoryDto): Promise<Categories> {
    try {
      await this.categoryRepository.update(id, body);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
