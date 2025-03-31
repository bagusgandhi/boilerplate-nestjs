import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';

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
}
