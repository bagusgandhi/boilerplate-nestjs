import {
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertStepGroupDto {
  @ApiProperty({
    example: 'Penyusunan',
    description: 'The title of the step group',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'contract',
    description: 'The type of step progress',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}
