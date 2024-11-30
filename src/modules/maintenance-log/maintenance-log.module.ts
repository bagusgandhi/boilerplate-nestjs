import { Module, forwardRef } from '@nestjs/common';
import { MaintenanceLogController } from './maintenance-log.controller';
import { MaintenanceLogService } from './maintenance-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLog } from './entities/maintenance-log.entity';
import { FlowModule } from '../flow/flow.module';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceLog]),
    forwardRef(() => AssetModule),
    FlowModule,
  ],
  controllers: [MaintenanceLogController],
  providers: [MaintenanceLogService],
  exports: [MaintenanceLogService],
})
export class MaintenanceLogModule {}
