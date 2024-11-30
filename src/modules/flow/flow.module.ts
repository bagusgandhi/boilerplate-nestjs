import { Module } from '@nestjs/common';
import { FlowController } from './flow.controller';
import { FlowService } from './flow.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flow } from './entities/flow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Flow])
  ],
  controllers: [FlowController],
  providers: [FlowService],
  exports: [FlowService]
})
export class FlowModule {}
