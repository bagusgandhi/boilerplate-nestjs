import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Products } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permission.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Get all products.',
  })
  @Public()
  @Get()
  async findAll(): Promise<Products[]> {
    return this.productsService.findAll();
  }

  @ApiOperation({
    summary: 'Get a product by id.',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Products> {
    return this.productsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create a product.',
  })
  @ApiBearerAuth()
  @Permissions('productManagement.createProduct')
  @Post()
  async create(@Body() body: CreateProductDto): Promise<Products> {
    return this.productsService.create(body);
  }

  @ApiOperation({
    summary: 'Update a product.',
  })
  @ApiBearerAuth()
  @Permissions('productManagement.updateProduct')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreateProductDto,
  ): Promise<Products> {
    return this.productsService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a product.',
  })
  @ApiBearerAuth()
  @Permissions('productManagement.deleteProduct')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productsService.delete(id);
  }
}
