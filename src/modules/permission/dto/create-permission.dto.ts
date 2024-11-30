import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {

  @ApiProperty({
    example: 'View List of User',
    description: 'The name of the permission',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user.viewListOfUser',
    description: 'The action based of name',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    example: '87c4daea-1b59-4c7b-9f79-4ce75b7f6fdc',
    description: 'The modules id',
  })
  @IsString()
  @IsNotEmpty()
  modulesId: string;

}