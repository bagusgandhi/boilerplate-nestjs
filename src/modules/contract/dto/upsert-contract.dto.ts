import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpsertContractDto {
  @ApiProperty({
    example: 'Perjanjian Sewa alat berat',
    description: 'The title of the contract',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '001/CRM-HO/LGL/2025',
    description: 'The number of the contract',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  contract_number: string;

  @ApiProperty({
    example: 'YYYY-MM-DD',
    description: 'start date contract',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    example: 'YYYY-MM-DD',
    description: 'end date contract',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({
    example: 'YYYY-MM-DD',
    description: 'end date contract',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  // opsional

  // mitra detail
  @ApiProperty({
    example: 'PT. Mitra Abadi',
    description: 'The name of the partner',
    required: false,
  })
  @IsString()
  @IsOptional()
  mitra_name?: string;
  
  @ApiProperty({
    example: 'Jl. Raya No. 1, Jakarta',
    description: 'The address of the partner',
    required: false,
  })
  @IsString()
  @IsOptional()
  mitra_address?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The NPWP of the partner',
    required: false,
  })
  @IsString()
  @IsOptional()
  mitra_npwp?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The SIUP of the partner',
    required: false,
  })
  @IsString()
  @IsOptional()
  mitra_siup?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The NIB/RBA of the partner',
    required: false,
  })
  @IsString()
  @IsOptional()
  mitra_no_nib_rba?: string;

  // representative detail
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the representative',
    required: false,
  })
  @IsString()
  @IsOptional()
  representative_name?: string;

  @ApiProperty({
    example: 'Manager',
    description: 'The position of the representative',
    required: false,
  })
  @IsString()
  @IsOptional()
  representative_position?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The identity of the representative',
    required: false,
  })
  @IsString()
  @IsOptional()
  representative_identity?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The authority detail of the representative',
    required: false,
  })
  @IsString()
  @IsOptional()
  representative_authority_detail?: string;

  // bank account detail
  @ApiProperty({
    example: 'Bank Mandiri',
    description: 'The name of the bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bank_name?: string;

  @ApiProperty({
    example: 'Jakarta Branch',
    description: 'The branch of the bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bank_branch?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The account number of the bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the account holder',
    required: false,
  })
  @IsString()
  @IsOptional()
  bank_account_name?: string;

  // others detail
  @ApiProperty({
    example: 'Perjanjian Sewa Alat Berat',
    description: 'The scopes of the contract',
    required: false,
  })
  @IsString()
  @IsOptional()
  scopes?: string;

  @ApiProperty({
    example: 'This is a sample contract',
    description: 'The notes of the contract',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 1000000,
    description: 'The costs of the contract',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  costs?: number;

  @ApiProperty({
    example: 'This is a sample contract',
    description: 'The payment and taxes of the contract',
    required: false,
  })
  @IsString()
  @IsOptional()
  payment_and_taxes?: string;

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
