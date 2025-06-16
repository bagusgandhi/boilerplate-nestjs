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
    body: CreateUploadsDto | CreateUploadsDto[],
    user: User,
  ) {

    if(Array.isArray(body)){
      const newUploads = body.map((upload) => {
        const newUpload = new Uploads();
        newUpload.originalName = upload.originalName;
        newUpload.path = upload.path;
        newUpload.size = upload.size;
        newUpload.user = user;

        newUpload.contract = upload.contract;
        newUpload.business_permits = upload.business_permits;
        newUpload.corporate_documents = upload.corporate_documents;
        
        return newUpload;
      });

      return queryRunner.manager.save(Uploads, newUploads);
    } else {
      const newUploads = new Uploads();
      newUploads.originalName = body.originalName;
      newUploads.path = body.path;
      newUploads.size = body.size;
      newUploads.user = user;

      newUploads.contract = body.contract;
      newUploads.business_permits = body.business_permits;
      newUploads.corporate_documents = body.corporate_documents;

      return queryRunner.manager.save(Uploads, newUploads);
    }
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

  async createMany(body: CreateUploadsDto[], userId: UuidParamDto) {
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

  async delete(id: string) {
    const queryRunner =
      this.uploadsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const uploads = await this.uploadsRepository.delete(id);

      await queryRunner.commitTransaction();
      return uploads;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error delete uploads: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteByCurrentUser(id: string, userId: UuidParamDto) {
    const queryRunner =
      this.uploadsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try { 
      const uploads = await this.uploadsRepository.findOne({ where: { id, user: { id: userId?.id } } });
      if (!uploads) {
        throw new Error('Uploads not found');
      }
      await this.uploadsRepository.delete(uploads.id);

      await queryRunner.commitTransaction();
      return uploads;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error delete uploads: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
