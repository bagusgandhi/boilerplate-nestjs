import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadsDto {

  @ApiProperty({
    example: 'image.png',
    description: 'The name of original file',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    example: 2000,
    description: 'The size number of file',
  })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiProperty({
    example: 2000,
    description: 'The size number of file',
  })
  @IsString()
  @IsOptional()
  path?: string;

}
