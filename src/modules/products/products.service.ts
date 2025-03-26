import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    private readonly categoryService: CategoriesService,
  ) {}

  async findAll(): Promise<Products[]> {
    try {
      const products = await this.productsRepository.find();
      return products;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Products> {
    try {
      const product = await this.productsRepository.findOne({
        where: { id },
        relations: {
          productCategories: {
            category: true,
          },
        },
        select: {
          productCategories: {
            id: true,
            category: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async create(body: CreateProductDto): Promise<Products> {
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
      const result = await this.productsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Create product
          const product = await transactionalEntityManager.save(Products, body);

          // Create product categories if provided
          if (body.categories) {
            const productCategories = body.categories.map((categoryId) =>
              transactionalEntityManager.create(ProductCategory, {
                product: product,
                category: { id: categoryId },
              }),
            );
            await transactionalEntityManager.save(
              ProductCategory,
              productCategories,
            );
          }

          return product;
        },
      );

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(id: string, body: CreateProductDto): Promise<Products> {
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
      const result = await this.productsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          try {
            // Update product
            await transactionalEntityManager.update(Products, id, body);

            // Handle product categories if provided
            if (body.categories) {
              // Delete existing product categories
              await transactionalEntityManager.delete(ProductCategory, {
                product: { id },
              });

              // Create new product categories
              const productCategories = body.categories.map((categoryId) =>
                transactionalEntityManager.create(ProductCategory, {
                  product: { id },
                  category: { id: categoryId },
                }),
              );
              await transactionalEntityManager.save(
                ProductCategory,
                productCategories,
              );
            }

            // Return updated product with relations
            return await transactionalEntityManager.findOne(Products, {
              where: { id },
              relations: ['productCategories'],
            });
          } catch (error) {
            // Log the specific error that occurred during transaction
            this.logger.error(`Transaction failed: ${error.message}`);
            throw error; // Re-throw to trigger transaction rollback
          }
        },
      );

      return result;
    } catch (error) {
      this.logger.error(error);
      // If it's already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // For other errors, throw a generic error
      throw new HttpException(
        'Failed to update product and its categories',
        error.statusCode || 500,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.productsRepository.delete(id);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
