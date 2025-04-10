import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class TemplatePaginationDto extends PaginationDto {
  @ApiProperty({
    example: '4556478a-1b72-40e4-9ec6-f07500db8280',
    description: 'Category ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
