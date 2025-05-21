import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";
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