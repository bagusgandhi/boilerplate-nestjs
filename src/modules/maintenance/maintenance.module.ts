import { Module, forwardRef } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { FlowModule } from '../flow/flow.module';
import { AssetModule } from '../asset/asset.module';
import { MaintenanceLogModule } from '../maintenance-log/maintenance-log.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance]),
    forwardRef(() => AssetModule),
    UserModule,
    FlowModule,
    MaintenanceLogModule,
  ],
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
