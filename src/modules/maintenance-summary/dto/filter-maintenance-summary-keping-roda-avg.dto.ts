import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class FilterMaintenanceSummaryKepingRodaAvgDto extends PaginationDto {
  @ApiProperty({
    description: 'Keping Roda Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  keping_roda?: string;

  @ApiProperty({
    description: 'The start date for the filter, in ISO 8601 format (e.g., 2024-01-01T00:00:00.000Z)',
    type: String,
    required: false, // This field is optional
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({
    description: 'The start date for the filter, in ISO 8601 format (e.g., 2024-01-01T00:00:00.000Z)',
    type: String,
    required: false, // This field is optional
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endedAt?: string;

}
