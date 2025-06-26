import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationDto } from "src/global/dto/pagination.dto";

export class FilterContractDto extends PaginationDto {
    @ApiProperty({
        description: 'The title of the contract',
        required: false,
    })
    @IsUUID('4', { each: true })
    @IsOptional()
    step_progress_id: string[];

    @ApiProperty({
        description: 'The step progress slug of the contract',
        required: false,
    })
    @IsArray()
    @IsString({ each: true }) // Validate each element in the array as a string
    @IsOptional()
    step_progress_slug?: string[];

    // start periode year
    @ApiProperty({
        example: '2025',
        description: 'Filter by start period year',
        required: false,
    })
    @IsString()
    @IsOptional()
    start_period_year?: string;

    @ApiProperty({
        example: '2025',
        description: 'Filter by end period year',
        required: false,
    })
    @IsString()
    @IsOptional()
    end_period_year?: string;

    @ApiProperty({
        example: '2025',
        description: 'Filter by reminder period year',
        required: false,
    })
    @IsString()
    @IsOptional()
    reminder_period_year?: string;

    @ApiProperty({
        example: '2025-01-01',
        description: 'Filter by start date',
        required: false,
    })
    @IsString()
    @IsOptional()
    start_date?: string;

    @ApiProperty({
        example: '2025-05-18', 
        description: 'Filter by end date',
        required: false,
    })
    @IsString()
    @IsOptional()
    end_date?: string;

}