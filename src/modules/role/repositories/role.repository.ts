import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Role> {
    try {
      const query = this.createQueryBuilder('role');
      query.leftJoinAndSelect('role.permissions', 'permission');
      query.andWhere('role.id = :id', { id });

      const role = await query.getOne();

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching role by ID');
      }
    }
  }

  async findByName(name: string) {
    try {
      const query = this.createQueryBuilder('role');
      query.andWhere('role.name = :name', { name });

      const role = await query.getOne();

      if (!role) {
        throw new NotFoundException(`Role with name ${name} not found`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching role by ID');
      }
    }
  }

  async queryPaginate(page: number, limit: number, search: string) {
    try {
      const query = this.createQueryBuilder('role')
        .leftJoinAndSelect('role.permissions', 'permission')
        .orderBy('role.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.andWhere(
          'role.name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const [results, total] = await query.getManyAndCount();

      return {
        page,
        total,
        results,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching role data');
    }
  }
}
