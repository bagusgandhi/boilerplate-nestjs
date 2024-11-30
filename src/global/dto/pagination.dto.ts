import { IsOptional, IsNumber, isBoolean, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    example: "some keyword",
    description: 'Search Filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Limit Data',
    required: false,
  })
  @Transform(({ value }) => (value === undefined ? 10 : Number(value)))
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    example: false,
    description: 'View All Data, Without pagination',
    required: false
  })
  @Transform(({ value }) => (value === undefined ? false : Boolean(value)))
  @IsOptional()
  @IsBoolean()
  viewAll?: boolean = false;

  @ApiPropertyOptional({
    type: String,
    description: 'Resourse order ex: field1:ASC,field2:DESC',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return {};

    return value.split(',').reduce((acc, orderStr) => {
      const [field, order] = orderStr.split(':');
      const formattedField = field.split('.').join('_'); // Convert dot notation to underscore if needed
      acc[formattedField] = (order || 'ASC').toUpperCase(); // Default to 'ASC' if no order is provided
      return acc;
    }, {});
  })
  @IsNotEmpty()
  order?: string;
}
