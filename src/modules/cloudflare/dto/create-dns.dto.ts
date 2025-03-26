import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDnsDto {
  @ApiProperty({
    example: 'example.com',
    description: 'The name of the domain',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '023e105f4ecef8ad9ca31a8372d0c353',
    description: 'The zone id of the domain',
  })
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @ApiProperty({
    example: 'A',
    description: 'The type of the dns record',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 3600,
    description: 'The ttl of the dns record',
  })
  @IsNumber()
  @IsNotEmpty()
  ttl: number;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'The ip address of the dns record',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'example.com',
    description: 'The comment of the dns record',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    example: true,
    description: 'The proxy status of the dns record',
  })
  @IsBoolean()
  @IsOptional()
  proxied?: boolean;
}
