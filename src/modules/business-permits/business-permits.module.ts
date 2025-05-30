import { Module } from '@nestjs/common';
import { BusinessPermitsController } from './business-permits.controller';
import { BusinessPermitsService } from './business-permits.service';
import { StepProgressModule } from '../step-progress/step-progress.module';
import { UserModule } from '../user/user.module';
import { UploadsModule } from '../uploads/uploads.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessPermits } from './entities/business-permits.entity';
import { BusinessPermitsHistory } from './entities/business-permits-history.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessPermits,
      BusinessPermitsHistory,
    ]),
    StepProgressModule,
    UserModule,
    UploadsModule,
  ],
  controllers: [BusinessPermitsController],
  providers: [BusinessPermitsService]
})
export class BusinessPermitsModule {}
