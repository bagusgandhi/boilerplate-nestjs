import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsOptional,
    IsNumber,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Transform } from 'class-transformer';
  
  export class UpsertBusinessPermitsDto {
    @ApiProperty({
      example: 'Perjanjian Sewa alat berat',
      description: 'The title of the business permits',
      required: true,
    })
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @ApiProperty({
      example: '001/CRM-HO/LGL/2025',
      description: 'The number of the business permits',
      required: true,
    })
    @IsString()
    @IsNotEmpty()
    business_permits_number: string;
  
    @ApiProperty({
      example: 'YYYY-MM-DD',
      description: 'start date business permits',
      required: true,
    })
    @IsDateString()
    @IsNotEmpty()
    start_date: string;
  
    @ApiProperty({
      example: 'YYYY-MM-DD',
      description: 'end date business permits',
      required: true,
    })
    @IsDateString()
    @IsNotEmpty()
    end_date: string;
  
    @ApiProperty({
      example: 'YYYY-MM-DD',
    description: 'end date business permits',
      required: true,
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
      example: 'This is a sample business permits',
      description: 'The notes of the business permits',
      required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;

    // add step progress id (for updating contract)
    @ApiProperty({
      example: '1234567890',
      description: 'The step progress id of the contract (for updating contract)',
      required: false,
    })
    @IsString()
    @IsOptional()
    step_progress_id?: string;
  
    @ApiPropertyOptional({
      description: 'file',
      format: 'binary',
    })
    file?: string;
  }
  