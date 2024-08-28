import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './repositories/role.repository';
import { PermissionModule } from '../permission/permission.module';
import { PermissionRepository } from '../permission/repositories/permission.repository';

@Module({
  imports: [
    PermissionModule,
    TypeOrmModule.forFeature([Role])
  ],
  providers: [RoleService, RoleRepository, PermissionRepository],
  controllers: [RoleController],
})
export class RoleModule {}
