import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUpdateMaintenanceDto } from './dto/create-maintenance.dto';
import { ParamsUpdateMaintenanceDto } from './dto/params-update-maintenance.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @ApiOperation({
    summary: 'Update maintenance.',
  })
  @ApiBearerAuth()
  @Patch()
  async update(@Body() body: CreateUpdateMaintenanceDto) {
    return this.maintenanceService.update(body);
  }

  @ApiOperation({
    summary: 'Get all Maintenance data.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(@Query() query: PaginationDto) {
    return this.maintenanceService.getAll(query);
  }

  @ApiOperation({
    summary: 'Get Maintenance data by id.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param() params: UuidParamDto) {
    return this.maintenanceService.get(params.id as string);
  }
}
