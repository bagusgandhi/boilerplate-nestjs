import { IsOptional, IsNumber, isBoolean, IsBoolean, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}
