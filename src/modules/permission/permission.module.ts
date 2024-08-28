import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Modules } from './entities/module.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repositories/permission.repository';
import { ModuleRepository } from './repositories/module.repository';
@Module({
  imports: [TypeOrmModule.forFeature([Permission, Modules])],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository, ModuleRepository],
})
export class PermissionModule {}
