import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Toko Online',
    description: 'The name of the category tenplate or product',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is Description Category for Toko Online',
    description: 'The Description of the category',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
