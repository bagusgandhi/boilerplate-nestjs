import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FlowService } from './flow.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { CreateUpdateFlowDto } from './dto/create-update-flow.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { sortDto } from 'src/global/dto/sort.dto';

@ApiTags('Flow')
@Controller('flow')
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @ApiOperation({
    summary: 'Get all flow data.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.viewAllFlow')
  @Get()
  async getAll(@Query() query: PaginationDto) {
    return this.flowService.getAll(query);
  }

  @ApiOperation({
    summary: 'Update Sort Order flow.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.updateFlow')
  @Patch('sort')
  async updateSort(@Body() body: sortDto) {
    return this.flowService.updateSort(body);
  }

  @ApiOperation({
    summary: 'Add New Flow.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.addNewFlow')
  @Post()
  async create(@Body() body: CreateUpdateFlowDto) {
    return this.flowService.create(body);
  }

  @ApiOperation({
    summary: 'Get flow by id.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.viewAllFlow')
  @Get(':id')
  async get(@Param() params: UuidParamDto) {
    return this.flowService.get(params.id as string);
  }

  @ApiOperation({
    summary: 'Update flow by id.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.updateFlow')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: CreateUpdateFlowDto) {
    return this.flowService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete flow by id.',
  })
  @ApiBearerAuth()
  @Permissions('flowManagement.deleteFlow')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.flowService.delete(id);
  }

}
