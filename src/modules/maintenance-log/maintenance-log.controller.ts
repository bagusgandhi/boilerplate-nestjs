import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { MaintenanceLogService } from './maintenance-log.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';

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

  @ApiOperation({
    summary: 'Update maintenance log by id.',
  })
  @ApiBearerAuth()
  // @Permissions('assetManagement.updateAsset')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: CreateMaintenanceLogDto, @GetUser() user: IUserRequest) {
    return this.maintenanceLogService.update(id, body, user);
  }
}
