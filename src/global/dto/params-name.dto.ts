// dto/uuid-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NameParamDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  name: string;
}
