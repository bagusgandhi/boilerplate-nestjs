import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StepProgress } from './entities/step-progress.entity';
import { ILike, Repository } from 'typeorm';
import { StepGroupService } from '../step-group/step-group.service';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UpsertStepProgressDto } from './dto/upsert-step-progress.dto';

@Injectable()
export class StepProgressService {
    private readonly logger = new Logger(StepProgressService.name);

    constructor(
        @InjectRepository(StepProgress)
        private stepProgressRepository: Repository<StepProgress>,
        private stepGroupService: StepGroupService,
    ) { }

    async findAll(query: PaginationDto): Promise<StepProgress[]> {
        try {
            let stepProgresses: StepProgress[];

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

            stepProgresses = await this.stepProgressRepository.find(options);
            return stepProgresses;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const stepProgress = await this.stepProgressRepository.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                },
                relations: ['step_groups'],
            });

            if (!stepProgress) {
                throw new NotFoundException('Step Progress not found');
            }

            return stepProgress;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findBySlug(slug: string): Promise<StepProgress> {
        try {
            const stepProgress = await this.stepProgressRepository.findOne({
                where: {
                    slug: slug,
                    deletedAt: null,
                },
            });

            if (!stepProgress) {
                throw new NotFoundException('Step Progress not found');
            }

            return stepProgress;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const stepProgress = await this.findById(id);
            if (!stepProgress) {
                throw new NotFoundException('Step Progress not found');
            }
            await this.stepProgressRepository.delete(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async create(stepProgressDto: UpsertStepProgressDto): Promise<StepProgress> {
        try {
            let stepGroup = null;

            if (stepProgressDto.step_group_id) {
                stepGroup = await this.stepGroupService.findById(stepProgressDto.step_group_id);
            }

            const stepProgress = this.stepProgressRepository.create({
                title: stepProgressDto.title,
                slug: stepProgressDto.title.toLowerCase().replace(/ /g, '-'),
                step_groups: stepGroup ? [stepGroup] : [],
            });
            return await this.stepProgressRepository.save(stepProgress);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async update(id: string, stepProgressDto: UpsertStepProgressDto): Promise<StepProgress> {
        try {
            const stepProgress = await this.findById(id);

            if (!stepProgress) {
                throw new NotFoundException('Step Progress not found');
            }
            await this.stepProgressRepository.update(id, stepProgressDto);
            return await this.findById(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
