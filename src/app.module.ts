import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './modules/auth/guard/role.guard';
import { PermissionsGuard } from './modules/auth/guard/permission.guard';
import { JwtAuthGuard } from './modules/auth/guard/jwt.guard';
import { FlowModule } from './modules/flow/flow.module';
import { AssetModule } from './modules/asset/asset.module';
import { MaintenanceLogModule } from './modules/maintenance-log/maintenance-log.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { HistoryActionLogModule } from './modules/history-action-log/history-action-log.module';
import { MaintenanceSummaryModule } from './modules/maintenance-summary/maintenance-summary.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AssetModule,
    FlowModule,
    MaintenanceModule,
    MaintenanceLogModule,
    HistoryActionLogModule,
    MaintenanceSummaryModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    },
  ],
})
export class AppModule {}
