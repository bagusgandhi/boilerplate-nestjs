// dto/uuid-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UuidParamDto {
  @ApiProperty({
    required: false
  })
  @IsUUID()
  id: string;
}
