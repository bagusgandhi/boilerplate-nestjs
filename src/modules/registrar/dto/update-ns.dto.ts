import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNsDto {
  @ApiProperty({
    example: ['ns1.example.com', 'ns2.example.com'],
    description: 'The nameservers of the domain',
  })
  @IsArray()
  @IsString({ each: true })
  nameservers?: string[];
}
