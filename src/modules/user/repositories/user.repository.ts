import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UuidParamDto } from 'src/global/dto/params-id.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: UuidParamDto) {
    try {
      const query = this.createQueryBuilder('user');
      query.leftJoinAndSelect('user.roles', 'role');
      query.leftJoinAndSelect('role.permissions', 'permission');
      query.andWhere('user.id = :id', { id });

      const user = await query.getOne();

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching user by ID');
      }
    }
  }

  async findByEmail(email: string) {
    try {
      const query = this.createQueryBuilder('user');
      query.leftJoinAndSelect('user.roles', 'role');
      query.leftJoinAndSelect('role.permissions', 'permission');
      query.andWhere('user.email = :email', { email });

      const user = await query.getOne();

      if (!user) {
        throw new NotFoundException(`User with Email ${email} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific NotFoundException
      } else {
        // Handle general query errors
        throw new InternalServerErrorException('Error fetching role by ID');
      }
    }
  }

  async queryPaginate(
    page: number,
    limit: number,
    search: string,
    roleId: string[],
    viewAll: boolean = false, // Add the viewAll flag
  ) {
    try {
      const query = this.createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.created_at',
          'user.updated_at',
          'role.id',
          'role.name'
        ]);
  
      // Apply role filter if provided
      if (roleId && roleId.length > 0) {
        query.andWhere('role.id IN (:...roleId)', { roleId });
      }
  
      // Apply search filter if provided
      if (search) {
        query.andWhere(
          'user.email LIKE :search OR user.name LIKE :search OR role.name LIKE :search',
          { search: `%${search}%` },
        );
      }
  
      // Conditionally apply pagination based on the viewAll flag
      if (!viewAll) {
        query
          .orderBy('user.created_at', 'DESC')
          .skip((page - 1) * limit)
          .take(limit);
      }
  
      // Get the results and total count
      const [results, total] = await query.getManyAndCount();
  
      // If viewAll is true, set total to the number of results returned
      const totalPages = viewAll ? 1 : Math.ceil(total / limit);
  
      return {
        page,
        total,
        results,
        totalPages,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error fetching user data');
    }
  }
  
  async findAllByRoleName(roleName: string[]) {
    try {
      const users = await this.find({ where: { roles: { name: In(roleName) } }, relations: ['roles'] });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user data');
    }
  }

  async findAllNameAndEmail(){
    try {
      const query = this.createQueryBuilder('user')
        .select([
          'user.id',
          'user.name',
          'user.email',
        ]);

      const users = await query.getMany();

      return users;
    } catch (error) {
      throw error;
    }
  }
  
}
