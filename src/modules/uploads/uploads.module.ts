import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Uploads } from './entities/uploads.entity';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Uploads])
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
