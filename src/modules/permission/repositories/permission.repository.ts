import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '../entities/permission.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private readonly dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Permission> {
    try {
      const query = this.createQueryBuilder('permission');
      query.leftJoinAndSelect('permission.module', 'module') 

      query.andWhere('permission.id = :id', { id });

      const permission = await query.getOne();

      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      return permission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching role by ID');
      }
    }
  }

  async findByAction(action: string) {
    try {
      const query = this.createQueryBuilder('permission');
      query.andWhere('permission.action = :action', { action });

      const permission = await query.getOne();

      if (!permission) {
        throw new NotFoundException(
          `Permission with action ${permission} not found`,
        );
      }

      return permission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching role by ID');
      }
    }
  }


}
