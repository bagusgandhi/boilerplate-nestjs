import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Modules } from '../entities/module.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ModuleRepository extends Repository<Modules> {
  constructor(private readonly dataSource: DataSource) {
    super(Modules, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Modules> {
    try {
      const query = this.createQueryBuilder('modules');
      query.leftJoinAndSelect('modules.permissions', 'permission')
      query.andWhere('modules.id = :id', { id });

      const modules = await query.getOne();

      if (!modules) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      return modules;
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
