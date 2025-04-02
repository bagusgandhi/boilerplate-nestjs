import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreateSiteDto,
  ): Promise<Site> {
    const site = this.siteRepository.create({
      cloudflare_zone_id: body.cloudflare_zone_id,
      db_name: body.db_name,
      db_user: body.db_user,
      db_password: body.db_password,
      port: body.port,
      status: body.status,
      order: { id: body.order.id },
    });

    return await queryRunner.manager.save(site);
  }

  async findByUser(
    user: IUserRequest,
    query: PaginationDto,
  ): Promise<{ data: Site[]; total: number }> {
    try {
      const { page, limit, search, viewAll } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.siteRepository
        .createQueryBuilder('site')
        .leftJoinAndSelect('site.order', 'order')
        .leftJoin('order.user', 'user')
        .where('user.id = :userId', { userId: user.id });

      if (search) {
        queryBuilder.where('order.domain_name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (!viewAll) {
        queryBuilder.limit(limit).offset(skip);
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to get sites by user');
    }
  }

  async findOne(id: string): Promise<Site> {
    try {
      const site = await this.siteRepository.findOne({
        where: { id },
        relations: ['order', 'order.invoice'],
      });
      if (!site) {
        throw new NotFoundException('Site not found');
      }
      return site;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get site');
    }
  }

  async findOneByUser(id: string, user: IUserRequest): Promise<Site> {
    try {
      const site = await this.siteRepository.findOne({
        where: { id, order: { user: { id: user.id } } },
        relations: ['order', 'order.invoice'],
        select: {
          order: {
            user: {
              email: true,
              name: true,
              phone: true,
              address: true,
            },
            invoices: {
              invoice_number: true,
              total: true,
              status: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      });
      if (!site) {
        throw new NotFoundException('Invoice not found');
      }
      return site;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
