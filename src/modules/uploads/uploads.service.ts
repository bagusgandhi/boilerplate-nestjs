import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Uploads } from './entities/uploads.entity';
import { QueryRunner, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateUploadsDto } from './dto/create-uploads.dto';
import { UserService } from '../user/user.service';
import { UuidParamDto } from 'src/global/dto/params-id.dto';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @InjectRepository(Uploads)
    private uploadsRepository: Repository<Uploads>,
    private readonly userService: UserService
  ) {}

  async findById(id: string) {
    try {
      const file = await this.uploadsRepository.findOneBy({ id });
      return file;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreateUploadsDto,
    user: User,
  ) {

    const newUploads = new Uploads();
    newUploads.originalName = body.originalName;
    newUploads.path = body.path;
    newUploads.size = body.size;
    newUploads.user = user

    // Save the maintenance record using the provided transaction.
    return queryRunner.manager.save(Uploads, newUploads);
  }

  async create(body: CreateUploadsDto, userId: UuidParamDto) {
    const queryRunner =
      this.uploadsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user: User = await this.userService.findUserById(userId);
      const result = await this.createWithTransaction(queryRunner, body, user);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error create uploads: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
