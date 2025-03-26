import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './entities/domain.entity';
import { CreateDomainDto } from './dto/create-domain.dto';
@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
  ) {}

  async findAll(): Promise<Domain[]> {
    try {
      const domains = await this.domainRepository.find();
      return domains;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async findOne(id: string): Promise<Domain> {
    try {
      const domain = await this.domainRepository.findOne({ where: { id } });
      return domain;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async create(body: CreateDomainDto): Promise<Domain> {
    try {
      const domain = await this.domainRepository.save(body);
      return domain;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async update(id: string, body: CreateDomainDto): Promise<Domain> {
    try {
      await this.domainRepository.update(id, body);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.domainRepository.delete(id);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }
}
