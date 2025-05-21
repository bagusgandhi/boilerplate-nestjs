import { Module } from '@nestjs/common';
import { StepGroupService } from './step-group.service';
import { StepGroupController } from './step-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepGroup } from './entities/step-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StepGroup,
    ]),
  ],
  providers: [StepGroupService],
  controllers: [StepGroupController],
  exports: [StepGroupService]
})
export class StepGroupModule {}
