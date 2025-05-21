import { Module } from '@nestjs/common';
import { StepProgressController } from './step-progress.controller';
import { StepProgressService } from './step-progress.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepProgress } from './entities/step-progress.entity';
import { StepGroupModule } from '../step-group/step-group.module';

@Module({
  imports: [
    StepGroupModule,
    TypeOrmModule.forFeature([
      StepProgress,
    ]),
  ],
  controllers: [StepProgressController],
  providers: [StepProgressService],
  exports: [StepProgressService]
})
export class StepProgressModule {}
