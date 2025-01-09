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
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    UploadsModule
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
    }
  ],
})
export class AppModule {}
