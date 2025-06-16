import { ApiPropertyOptional } from '@nestjs/swagger';

export class BulkInsertDto {

  @ApiPropertyOptional({
    description: 'file',
    format: 'binary',
  })
  file?: string;
}
