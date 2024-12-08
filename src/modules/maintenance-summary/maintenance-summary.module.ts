import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceSummaryMonthlyAvg } from './entities/mv_maintenance_log_monthly_avg.entity';
import { MaintenanceSummaryMonthlyKepingRodaAvg } from './entities/mv_maintenance_log_monthly_keping_roda_avg.entity';
import { MaintenanceSummaryController } from './maintenance-summary.controller';
import { MaintenanceSummaryService } from './maintenance-summary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceSummaryMonthlyAvg,
      MaintenanceSummaryMonthlyKepingRodaAvg,
    ]),
  ],
  controllers: [MaintenanceSummaryController],
  providers: [MaintenanceSummaryService],
  exports: [MaintenanceSummaryService],
})
export class MaintenanceSummaryModule {}
