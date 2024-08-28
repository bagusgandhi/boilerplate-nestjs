import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { In } from 'typeorm';
import { UuidParamDto } from 'src/global/dto/params-id.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findRoleById(id: UuidParamDto) {
    try {
      const role = await this.roleRepository.findById(id as any);
      // delete role.permissions;
      return role;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findAll(query: PaginationDto) {
    try {
      let roles: any;

      if (query.viewAll) {
        roles = await this.roleRepository.find();
      } else {
        roles = await this.roleRepository.queryPaginate(
          query.page,
          query.limit,
          query.search
        );
      }

      return roles;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async create(body: CreateRoleDto) {
    try {
      const existingRole = await this.roleRepository.findOne({
        where: { name: body.name },
        withDeleted: true, // Include soft-deleted roles in the search
      });

      if (existingRole) {
        if (existingRole.deletedAt) {
          await this.roleRepository.restore(existingRole.id);
          existingRole.deletedAt = null; // Clear the deletedAt timestamp
  
          if (body.permissionIds) {
            const permissions = await this.permissionRepository.findBy({
              id: In(body.permissionIds),
            });
    
            if (permissions.length !== body.permissionIds.length) {
              throw new NotFoundException('One or more permissions not found');
            }
    
            existingRole.permissions = permissions;
          }
          // Save the restored role with any updates
          return await this.roleRepository.save(existingRole);
        }
        else {
          throw new ConflictException('Role with this name already exists');
        }
      }

      const newRole = this.roleRepository.create({
        name: body.name,
      });

      if (body.permissionIds) {
        const permissions = await this.permissionRepository.findBy({
          id: In(body.permissionIds),
        });

        if (permissions.length !== body.permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }

        newRole.permissions = permissions;
      }

      return this.roleRepository.save(newRole);
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }

  async delete(id: string) {
    try {

      const role = await this.roleRepository.findOne({
        where: { id: id },
        relations: ['permissions'],
      });

      if (!role) {
        throw new NotFoundException('Role not found')
        // throw new Error('Role not found');
      }

      role.permissions = [];
      await this.roleRepository.save(role); // Save the role without permissions
  
      // Soft delete the role (sets the deletedAt column)
      await this.roleRepository.softDelete(id);

      return { message: 'Delete role success!' };
    } catch (error) {
      this.logger.error(error);
      throw error
      // throw new HttpException(error.message, error.status);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.roleRepository.findById(id);

      if (updateRoleDto.name) {
        role.name = updateRoleDto.name;
      }

      if (updateRoleDto.permissionIds) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRoleDto.permissionIds),
        });

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }

        role.permissions = permissions;
      }

      return this.roleRepository.save(role);
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }
}
