import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({
    example: 'Coffee Shop',
    description: 'The name of the template',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is Description Template for Coffee Shop',
    description: 'The Description of the template',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The url of the template',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The url of the template image',
  })
  @IsString()
  @IsNotEmpty()
  img_url: string;

  @ApiProperty({
    example: ['"0ae30c55-2139-4173-b63a-cded587b5e23"'],
    description: 'The id categories data',
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  categories: string[];
}
