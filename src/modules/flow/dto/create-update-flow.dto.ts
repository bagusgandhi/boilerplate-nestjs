import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateFlowDto {

  @ApiProperty({
    example: 'Finishing',
    description: 'The name of the flow',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Finish the process',
    description: 'The description of the flow',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: { input: [ "diameter", "flank" ] },
    description: 'The metadata should show to input',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

}
