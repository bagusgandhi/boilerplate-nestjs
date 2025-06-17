import { Module } from '@nestjs/common';
import { CorporateDocumentsController } from './corporate-documents.controller';
import { CorporateDocumentsService } from './corporate-documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateDocuments } from './entities/corporate-documents.entity';
import { CorporateDocumentsHistory } from './entities/corporate-documents-history.entity';
import { StepProgressModule } from '../step-progress/step-progress.module';
import { UserModule } from '../user/user.module';
import { UploadsModule } from '../uploads/uploads.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorporateDocuments, CorporateDocumentsHistory]),
    StepProgressModule,
    UserModule,
    UploadsModule,
    NotificationsModule
  ],
  controllers: [CorporateDocumentsController],
  providers: [CorporateDocumentsService],
  exports: [CorporateDocumentsService]
})
export class CorporateDocumentsModule {}
