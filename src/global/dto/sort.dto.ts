// dto/uuid-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class sortDto {
  @ApiProperty({
    required: true,
    description: 'Array of uuids flow'
  })
  @IsArray()
  @IsUUID('4', { each: true })
  sort: string[];
}
