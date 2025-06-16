import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ContractApprovalType } from "../entities/contract-approval.entity";

export class AddApprovalDto {
    @ApiProperty({
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({
        example: "paraf | sign",
        required: true
    })
    @IsEnum(ContractApprovalType)
    @IsNotEmpty()
    type: ContractApprovalType

    @ApiProperty({
        example: true,
        required: true
    })
    @IsBoolean()
    @IsNotEmpty()
    done: boolean;
}