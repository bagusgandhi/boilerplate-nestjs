// dto/uuid-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class NameParamDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/\s+/g, '') : value)
  name: string;
}
