import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadsFileDto {

  @ApiPropertyOptional({
    description: 'file',
    format: 'binary',
  })
  file?: string;

}
