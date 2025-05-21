import { Module } from '@nestjs/common';
import { StepGroup } from '../step-group/entities/step-group.entity';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractHistory } from './entities/contract-history.entity';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { StepProgressModule } from '../step-progress/step-progress.module';
import { UserModule } from '../user/user.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Contract,
            ContractHistory,
        ]),
        StepProgressModule,
        UserModule,
        UploadsModule,
    ],
    controllers: [ContractController],
    providers: [ContractService]
})
export class ContractModule {}
