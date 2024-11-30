import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AssetType, CarriageType } from './create-update-asset.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class FilterAssetDto extends PaginationDto {
  @ApiProperty({
    example: 'TrainSet',
    description: 'The Asset Type',
  })
  @IsEnum(AssetType)
  @IsNotEmpty()
  asset_type: AssetType;

  @ApiProperty({
    example: 'GB',
    description: 'The Carriage Type',
  })
  @IsEnum(CarriageType)
  @IsOptional()
  carriage_type?: CarriageType;
}
