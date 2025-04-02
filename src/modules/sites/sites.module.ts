import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';

@Module({
  providers: [SitesService],
  exports: [SitesService],
  imports: [TypeOrmModule.forFeature([Site])],
  controllers: [SitesController],
})
export class SitesModule {}
