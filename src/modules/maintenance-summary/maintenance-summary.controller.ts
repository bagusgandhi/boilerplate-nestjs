import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { FilterMaintenanceSummaryMonthlyAvgDto } from './dto/filter-maintenance-summary-monthly-avg.dto';
import { MaintenanceSummaryService } from './maintenance-summary.service';
import { FilterMaintenanceSummaryKepingRodaAvgDto } from './dto/filter-maintenance-summary-keping-roda-avg.dto';
import { Response } from 'express';

@ApiTags('Maintenance Summary')
@Controller('maintenance-summary')
export class MaintenanceSummaryController {
  constructor(private readonly maintenanaceSummaryService: MaintenanceSummaryService) {}

  @ApiOperation({
    summary: 'Get all Maintenance summary data.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(@Query() query: FilterMaintenanceSummaryMonthlyAvgDto) {
    return this.maintenanaceSummaryService.getAllMonthlyAvg(query);
  }

  @ApiOperation({
    summary: 'Export Maintenance summary data.',
  })
  @ApiBearerAuth()
  @Get('export')
  async exportData(
    @Query() query: FilterMaintenanceSummaryMonthlyAvgDto,
    @Res() res: Response,
  ) {
    return this.maintenanaceSummaryService.exportMonthlyAvgAsPDF(query, res);
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
    summary: 'Get all Maintenance Log data count.',
  })
  @ApiBearerAuth()
  @Get('count')
  async getAllCount(@Query() query: FilterMaintenanceSummaryMonthlyAvgDto) {
    return this.maintenanaceSummaryService.getAllMonthlyCount(query);
  }


  @ApiOperation({
    summary: 'Get all Maintenance Log data.',
  })
  @ApiBearerAuth()
  @Get('wheel')
  async getKepingRoda(@Query() query: FilterMaintenanceSummaryKepingRodaAvgDto) {
    return this.maintenanaceSummaryService.getAllMonthlyKepingRodaAvg(query);
  }
}
