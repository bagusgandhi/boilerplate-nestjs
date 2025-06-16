import {
    IsNotEmpty,
    IsBoolean,
    IsString,
    IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessDto {
    @ApiProperty({
        example: false,
        required: false,
    })
    @IsBoolean()
    @IsNotEmpty()
    approve: boolean;

    @ApiProperty({
        example: 'This is a sample contract',
        description: 'The notes of the contract',
        required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;
}