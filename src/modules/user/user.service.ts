import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { SignUpDto } from '../auth/dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { RoleRepository } from '../role/repositories/role.repository';
import { PaginationDto } from '../../global/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findUserById(id: UuidParamDto) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      delete user.password;
      // delete user.salt
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }

  async create(signUpDto: SignUpDto) {
    try {
      const existingUser = await this.userRepository.findOneBy({
        email: signUpDto.email,
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

      const defaultRole = await this.roleRepository.findByName('user');
      if (!defaultRole) {
        throw new ConflictException('Default role "User" does not exist');
      }

      const newUser = this.userRepository.create({
        email: signUpDto.email,
        name: signUpDto.name,
        salt,
        password: hashedPassword,
        roles: [defaultRole], // Assign the "User" role by default
      });

      return this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(id: UuidParamDto, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateUserDto.email) {
        const existingUser:any = await this.userRepository.findByEmail(
          updateUserDto.email,
        );
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException('User with this email already exists');
        }
      }

      if (updateUserDto.name) {
        user.name = updateUserDto.name;
      }

      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(updateUserDto.password, salt);
        user.salt = salt;
      }

      if (updateUserDto.roleId) {
        const role = await this.roleRepository.findById(updateUserDto.roleId);

        if (!role) {
          throw new NotFoundException('Role not found');
        }

        user.roles = [role];
      }

      return this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);

      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }

  async findAll(query: any) {
    try {
      console.log("query", query)
      const users = await this.userRepository.queryPaginate(
        query.page,
        query.limit,
        query.search,
        query.roleId
      );
      return users;
    } catch (error) {
      this.logger.error(error);
      throw error;
      // throw new HttpException(error.message, error.statusCode);
    }
  }

  async delete(id: string) {
    try {
      await this.userRepository.softDelete(id);
      return { message: 'Delete user success!' };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
