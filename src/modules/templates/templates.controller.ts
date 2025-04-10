import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { Templates } from './entities/templates.entity';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permission.decorator';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatePaginationDto } from './dto/template-pagination.dto';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @ApiOperation({
    summary: 'Get all templates.',
  })
  @Public()
  @Get()
  async findAll(
    @Query() query: TemplatePaginationDto,
  ): Promise<{ data: Templates[]; total: number }> {
    return this.templatesService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get a template by id.',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Templates> {
    return this.templatesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create a template.',
  })
  @ApiBearerAuth()
  @Permissions('templateManagement.createTemplate')
  @Post()
  async create(@Body() body: CreateTemplateDto): Promise<Templates> {
    return this.templatesService.create(body);
  }

  @ApiOperation({
    summary: 'Update a template.',
  })
  @ApiBearerAuth()
  @Permissions('templateManagement.updateTemplate')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
  ): Promise<Templates> {
    return this.templatesService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a template.',
  })
  @ApiBearerAuth()
  @Permissions('templateManagement.deleteTemplate')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.templatesService.delete(id);
  }
}
