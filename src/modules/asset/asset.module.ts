import { Module, forwardRef } from '@nestjs/common';
import { Asset } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { MaintenanceLogModule } from '../maintenance-log/maintenance-log.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    forwardRef(() => MaintenanceModule),
    forwardRef(() => MaintenanceLogModule),
    UserModule
    // FlowModule,
    // FlowModule,
    // forwardRef(() => MaintenanceModule),
    // MaintenanceModule
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService]
})
export class AssetModule {}
