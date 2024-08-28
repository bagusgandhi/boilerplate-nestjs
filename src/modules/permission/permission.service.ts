import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PermissionRepository } from './repositories/permission.repository';
import { ModuleRepository } from './repositories/module.repository';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-role.dto';
import { Modules } from './entities/module.entity';
import { EntityManager, In } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAllModule() {
    try {
      const query = this.moduleRepository.createQueryBuilder('modules');
      query.leftJoinAndSelect('modules.permissions', 'permission');

      return await query.getMany();
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async findModuleById(id: string) {
    try {
      const moduleData = await this.moduleRepository.findById(id);

      if (!moduleData) {
        throw new NotFoundException('Module not found');
      }

      return moduleData;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async createModule(body: CreateModuleDto) {
    try {
      const existingModule = await this.moduleRepository.findOne({
        where: { name: body.name },
        withDeleted: true, // Include soft-deleted modules in the search
      });

      if (existingModule) {
        if (existingModule.deletedAt) {
          // If module exists but was soft-deleted, restore it
          existingModule.deletedAt = null;
          return await this.moduleRepository.save(existingModule);
        } else {
          throw new ConflictException('Module already exists and is active');
        }
      }

      const newModule = this.moduleRepository.create({
        name: body.name,
      });

      return this.moduleRepository.save(newModule);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async updateModule(
    id: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<Modules> {
    try {
      const moduleData = await this.moduleRepository.findById(id);

      if (updateModuleDto.name) {
        moduleData.name = updateModuleDto.name;
      }

      if (updateModuleDto.permissionIds) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateModuleDto.permissionIds),
        });

        if (permissions.length !== updateModuleDto.permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }

        moduleData.permissions = permissions;
      }

      return this.moduleRepository.save(moduleData);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async deleteModule(id: string) {
    try {
      const moduleData = await this.moduleRepository.findOne({
        where: { id: id },
        relations: ['permissions'], // Load the related permissions
      });

      if (!moduleData) {
        throw new NotFoundException('Module not found');
      }

      await this.moduleRepository.softDelete(id);

      for (const permission of moduleData.permissions) {
        permission.deletedAt = new Date();
        await permission.save();
      }

      return { message: 'Delete module success!' };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findPermissionById(id: string) {
    try {
      const permission = await this.permissionRepository.findById(id);

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      return permission;
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }

  async createPermission(body: CreatePermissionDto) {
    try {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: body.name },
        withDeleted: true, // Include soft-deleted modules in the search
      });

      if (existingPermission) {
        if (existingPermission.deletedAt) {
          existingPermission.deletedAt = null;
          return await this.permissionRepository.save(existingPermission);
        } else {
          throw new ConflictException('Permission already exists and is active');
        }
      }

      const moduleData = await this.moduleRepository.findOne({
        where: { id: body.modulesId },
      });

      const newPermission = this.permissionRepository.create({
        name: body.name,
        module: moduleData,
        action: body.action,
      });

      return this.permissionRepository.save(newPermission);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async updatePermission(
    id: string,
    body: UpdatePermissionDto,
  ): Promise<Permission> {
    try {
      return await this.permissionRepository.manager.transaction(
        async (manager: EntityManager) => {
          const permission = await manager.findOne(Permission, {
            where: { id },
            relations: ['module'],
          });
          if (!permission) {
            throw new NotFoundException('Permission not found');
          }

          const { name, modulesId, action } = body;

          if (name) {
            permission.name = name;
          }

          if (action) {
            permission.action = action;
          }

          if (modulesId) {
            const modules = await manager.findOne(Modules, {
              where: { id: modulesId },
            });
            if (!module) {
              throw new NotFoundException('Module not found');
            }
            permission.module = modules;
          }

          return manager.save(permission);
        },
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async deletePermission(id: string) {
    try {
      await this.permissionRepository.softDelete(id);
      return { message: 'Delete Permission success!' };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
