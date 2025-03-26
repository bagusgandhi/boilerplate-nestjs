import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { Categories } from './entities/categories.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'Get all categories.',
  })
  @Public()
  @Get()
  async findAll(): Promise<Categories[]> {
    return this.categoriesService.findAll();
  }

  @ApiOperation({
    summary: 'Get a category by id.',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Categories> {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create a category.',
  })
  @ApiBearerAuth()
  @Permissions('categoryManagement.createCategory')
  @Post()
  async create(@Body() body: CreateCategoryDto): Promise<Categories> {
    return this.categoriesService.create(body);
  }

  @ApiOperation({
    summary: 'Update a category.',
  })
  @ApiBearerAuth()
  @Permissions('categoryManagement.updateCategory')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreateCategoryDto,
  ): Promise<Categories> {
    return this.categoriesService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a category.',
  })
  @ApiBearerAuth()
  @Permissions('categoryManagement.deleteCategory')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.categoriesService.delete(id);
  }
}
