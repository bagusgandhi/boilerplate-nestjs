import { Module } from '@nestjs/common';
import { BusinessPermitsController } from './business_permits.controller';
import { BusinessPermitsService } from './business_permits.service';

@Module({
  controllers: [BusinessPermitsController],
  providers: [BusinessPermitsService]
})
export class BusinessPermitsModule {}
