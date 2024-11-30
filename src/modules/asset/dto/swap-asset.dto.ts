import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AssetType, CarriageType } from './create-update-asset.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class SwapAssetDto {
  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Asset id that need active or using',
  })
  @IsUUID()
  @IsNotEmpty()
  active_asset_id: AssetType;

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Asset id that no need active or not using',
  })
  @IsUUID()
  @IsNotEmpty()
  inactive_asset_id?: CarriageType;

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Parrent of Asset',
  })
  @IsUUID()
  @IsNotEmpty() // Optional if parentAsset can be null
  parent_asset_id?: string; // This will hold the ID of the parent asset
}
