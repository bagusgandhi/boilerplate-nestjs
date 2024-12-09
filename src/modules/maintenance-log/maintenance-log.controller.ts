import { Controller, Get, Param, Query } from '@nestjs/common';
import { MaintenanceLogService } from './maintenance-log.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';

@ApiTags('Maintenance Log')
@Controller('maintenance-log')
export class MaintenanceLogController {
  constructor(private readonly maintenanceLogService: MaintenanceLogService) {}

  @ApiOperation({
    summary: 'Get all Maintenance Log data.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(@Query() query: PaginationDto) {
    return this.maintenanceLogService.getAll(query);
  }

  @ApiOperation({
    summary: 'Get Maintenance Log data by id.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param() params: UuidParamDto) {
    return this.maintenanceLogService.get(params.id as string);
  }
}
