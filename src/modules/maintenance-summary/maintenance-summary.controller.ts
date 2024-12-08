import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { FilterMaintenanceSummaryMonthlyAvgDto } from './dto/filter-maintenance-summary-monthly-avg.dto';
import { MaintenanceSummaryService } from './maintenance-summary.service';
@ApiTags('Maintenance Summary')
@Controller('maintenance-summary')
export class MaintenanceSummaryController {
  constructor(private readonly maintenanaceSummaryService: MaintenanceSummaryService) {}

  @ApiOperation({
    summary: 'Get all Maintenance Log data.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(@Query() query: FilterMaintenanceSummaryMonthlyAvgDto) {
    return this.maintenanaceSummaryService.getAllMonthlyAvg(query);
  }

  @ApiOperation({
    summary: 'Get all Maintenance Log data.',
  })
  @ApiBearerAuth()
  @Get('series')
  async getAllSeries(@Query() query: FilterMaintenanceSummaryMonthlyAvgDto) {
    return this.maintenanaceSummaryService.getAllMonthlySeries(query);
  }


  @ApiOperation({
    summary: 'Get all Maintenance Log data.',
  })
  @ApiBearerAuth()
  @Get('wheel')
  async getKepingRoda(@Query() query: PaginationDto) {
    return this.maintenanaceSummaryService.getAllMonthlyKepingRodaAvg(query);
  }
}