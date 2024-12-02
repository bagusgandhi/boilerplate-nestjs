import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class FilterListMaintenanceDto extends PaginationDto {
  @ApiProperty({
    description: 'Status Maintenance',
    required: false
  })
  @Transform(({ value }) => (value === undefined ? true : Boolean(value)))
  @IsBoolean()
  @IsOptional()
  is_maintenance?: boolean = true;

}
