import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { StepGroup } from './entities/step-group.entity';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UpsertStepGroupDto } from './dto/upsert-step-group.dto';

@Injectable()
export class StepGroupService {
    private readonly logger = new Logger(StepGroupService.name);

    constructor(
        @InjectRepository(StepGroup)
        private stepGroupRepository: Repository<StepGroup>,
    ) { }

    async findAll(query: PaginationDto): Promise<StepGroup[]> {
        try {
            let stepGroup: StepGroup[];

            const whereClause: any = {
                deletedAt: null,
            };

            // Add title search filter if present
            if (query.search) {
                whereClause.title = ILike(`%${query.search}%`); // For case-insensitive LIKE
            }

            const options: any = {
                where: whereClause,
                order: {
                    created_at: 'DESC',
                },
            };

            if (!query.viewAll) {
                options.skip = query.page * query.limit;
                options.take = query.limit;
            }

            stepGroup = await this.stepGroupRepository.find(options);
            return stepGroup;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const stepGroups = await this.stepGroupRepository.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                },
                relations: ['step_progresses'],
            });

            if (!stepGroups) {
                throw new NotFoundException('Step Group not found');
            }

            return stepGroups;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.stepGroupRepository.delete(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async create(stepGroupDto: UpsertStepGroupDto): Promise<StepGroup> {
        try {
            const stepGroup = this.stepGroupRepository.create(stepGroupDto);
            return await this.stepGroupRepository.save(stepGroup);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async update(id: string, stepGroupDto: UpsertStepGroupDto): Promise<StepGroup> {
        try {
            const stepGroup = await this.findById(id);
            if (!stepGroup) {
                throw new NotFoundException('Step Group not found');
            }
            await this.stepGroupRepository.update(id, stepGroupDto);
            return await this.findById(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

}
