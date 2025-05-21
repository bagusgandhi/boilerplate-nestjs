import { Module } from '@nestjs/common';
import { CorporateDocumentsController } from './corporate_documents.controller';
import { CorporateDocumentsService } from './corporate_documents.service';

@Module({
  controllers: [CorporateDocumentsController],
  providers: [CorporateDocumentsService]
})
export class CorporateDocumentsModule {}
