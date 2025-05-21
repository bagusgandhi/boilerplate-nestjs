import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertStepProgressDto {
  @ApiProperty({
    example: 'start',
    description: 'The title of the step progress',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The uuid of the step group id',
  })
  @IsUUID()
  @IsOptional()
  step_group_id?: string;
}
