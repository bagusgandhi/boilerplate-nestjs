import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './entities/domain.entity';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';
import { HttpModule } from '@nestjs/axios';
import { RegistrarModule } from '../registrar/registrar.module';

@Module({
  imports: [TypeOrmModule.forFeature([Domain]), HttpModule, RegistrarModule],
  providers: [DomainService],
  exports: [DomainService],
  controllers: [DomainController],
})
export class DomainModule {}
