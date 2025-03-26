import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [SitesService],
  exports: [SitesService],
  imports: [TypeOrmModule.forFeature([Site])],
})
export class SitesModule {}
