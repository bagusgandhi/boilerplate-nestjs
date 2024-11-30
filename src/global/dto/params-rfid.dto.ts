// dto/uuid-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RfidParamDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  rfid: string;
}
