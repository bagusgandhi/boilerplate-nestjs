import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {

  @ApiProperty({
    example: 'Admin',
    description: 'The name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ['87c4daea-1b59-4c7b-9f79-4ce75b7f6fdc', '3a64d9a1-51dc-49c8-8e71-65902aedfaf4'],
    description: 'The ids of the role',
  })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];

}
