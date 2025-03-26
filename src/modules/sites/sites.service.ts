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
    const site = new Site();
    site.cloudflare_zone_id = body.cloudflare_zone_id;
    site.db_name = body.db_name;
    site.db_user = body.db_user;
    site.db_password = body.db_password;
    site.port = body.port;
    site.status = body.status;
    site.order = body.order;

    await queryRunner.manager.save(Site, site);
    return site;
  }
}
