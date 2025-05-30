import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, In, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { BusinessPermits } from './entities/business-permits.entity';
import { StepProgressService } from '../step-progress/step-progress.service';
import { UserService } from '../user/user.service';
import { UploadsService } from '../uploads/uploads.service';
import { FilterBusinessPermitsDto } from './dto/filter-business-permits.dto';
import moment from 'moment';
import { FilterContractDto } from '../contract/dto/filter-contract.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UpsertBusinessPermitsDto } from './dto/upsert-business-permits.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { User } from '../user/entities/user.entity';
import { StepProgress } from '../step-progress/entities/step-progress.entity';
import { BusinessPermitsHistory } from './entities/business-permits-history.entity';

@Injectable()
export class BusinessPermitsService {
    private readonly logger = new Logger(BusinessPermitsService.name);

    constructor(
        @InjectRepository(BusinessPermits)
        private businessPermitsRepository: Repository<BusinessPermits>,
        @InjectRepository(BusinessPermitsHistory)
        private businessPermitsHistoryRepository: Repository<BusinessPermitsHistory>,
        private stepProgressService: StepProgressService,
        private userService: UserService,
        private uploadsService: UploadsService,
    ) {}

    async findAll(query: FilterBusinessPermitsDto) {
        try {
            const { 
                search,
                step_progress_id, 
                start_date, 
                end_date,
                viewAll,
                page = 0,
                limit = 10 
            } = query;

            // Base query options
            const queryOptions: FindManyOptions<BusinessPermits> = {
                relations: ['step_progress'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    business_permits_number: true,
                    description: true,
                    start_date: true,
                    end_date: true,
                    notes: true,
                    created_at: true,
                },
                where: {}
            };

            // Build where conditions
            const whereConditions: any = {};

            if (search) {
                whereConditions.title = ILike(`%${search}%`);
            }

            if (step_progress_id) {
                whereConditions.step_progress = { id: In(step_progress_id) };
            }

            if (start_date) {
                const startOfDay = moment(start_date).startOf('day').toDate();
                whereConditions.start_date = MoreThan(startOfDay);
            }

            if (end_date) {
                const endOfDay = moment(end_date).endOf('day').toDate();
                whereConditions.end_date = LessThan(endOfDay);
            }

            if (!viewAll) {
                whereConditions.deletedAt = null;
                queryOptions.skip = page * limit;
                queryOptions.take = limit;
            }

            queryOptions.where = whereConditions;

            // Execute query
            const businessPermits = await this.businessPermitsRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.businessPermitsRepository.count({
                where: whereConditions
            }) : businessPermits.length;

            return {
                data: businessPermits,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: !viewAll ? Math.ceil(total / limit) : 1
            };
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findAllByCurrentUser(query: FilterContractDto, userId: string) {
        try {
            const { 
                step_progress_id, 
                start_date, 
                end_date, 
                viewAll,
                page = 0,
                limit = 10 
            } = query;

            // Base query options
            const queryOptions: FindManyOptions<BusinessPermits> = {
                relations: ['step_progress', 'user'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    business_permits_number: true,
                    description: true,
                    start_date: true,
                    end_date: true,
                    notes: true,
                    created_at: true,
                },
                where: {}
            };

            // Build where conditions
            const whereConditions: any = {
                user: { id: userId }
            };

            if (step_progress_id) {
                whereConditions.step_progress = { id: In(step_progress_id) };
            }

            // Optimize date range queries using moment.js
            if (start_date) {
                const startOfDay = moment(start_date).startOf('day').toDate();
                whereConditions.start_date = MoreThan(startOfDay);
            }

            if (end_date) {
                const endOfDay = moment(end_date).endOf('day').toDate();
                whereConditions.end_date = LessThan(endOfDay);
            }

            if (!viewAll) {
                whereConditions.deletedAt = null;
                queryOptions.skip = page * limit;
                queryOptions.take = limit;
            }

            queryOptions.where = whereConditions;

            // Execute query
            const businessPermits = await this.businessPermitsRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.businessPermitsRepository.count({
                where: whereConditions
            }) : businessPermits.length;

            return {
                data: businessPermits,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: !viewAll ? Math.ceil(total / limit) : 1
            };

        } catch (error) {
            this.logger.error('Error in findAllByCurrentUser:', error);
            throw error;
        }
    }

    async findByIdByCurrentUser(id: string, userId: string) {
        try {
            const businessPermits = await this.businessPermitsRepository.findOne({
                where: {
                    id: id,
                    user: { id: userId },
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            return businessPermits;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const businessPermits = await this.businessPermitsRepository.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            if (!businessPermits) {
                throw new NotFoundException('Business permits not found');
            }

            return businessPermits;

        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findByUser(
        user: IUserRequest,
        query: PaginationDto,
    ) : Promise<{ data: BusinessPermits[]; total: number }>{
        try {
            const { page, limit, search, viewAll } = query;
            const skip = (page - 1) * limit;

            const queryBuilder = this.businessPermitsRepository
                .createQueryBuilder('business_permits')
                .leftJoinAndSelect('business_permits.user', 'user')
                .where('business_permits.user.id = :user', { user: user.id })
                .select([
                    'business_permits.id',
                    'business_permits.title',
                    'business_permits.business_permits_number',
                    'business_permits.description',
                    'business_permits.start_date',
                    'business_permits.end_date',
                    'business_permits.notes',
                    'business_permits.created_at',
                ]);

            if (search) {
                queryBuilder.where('business_permits.business_permits_number ILIKE :search', {
                    search: `%${search}%`,
                });
            }

            if (!viewAll) {
                queryBuilder.skip(skip).take(limit);
            }

            const [data, total] = await queryBuilder.getManyAndCount();

            return {
                data,
                total,
            };

        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async create(body: UpsertBusinessPermitsDto, userId: UuidParamDto, uploadsData: CreateUploadsDto[]) {
        const queryRunner =
        this.businessPermitsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find user and step progress
            const user: User = await this.userService.findUserById(userId);
            const stepProgress = await this.stepProgressService.findBySlug("mulai");

            // insert contract data
            const businessPermits = this.businessPermitsRepository.create({
                ...body,
                step_progress: stepProgress,
                user: user,
            });
            const savedBusinessPermits = await queryRunner.manager.save(businessPermits);

            //  insert contract history data
            // await this.createBusinessPermitsHistoryWithTransaction(queryRunner, savedBusinessPermits, stepProgress, "Pengajuan Dibuat");

            // insert uploads data within transaction
            if (uploadsData && uploadsData.length > 0) {
                const uploadsPayload = uploadsData.map((upload) => ({
                    originalName: upload.originalName,
                    path: upload.path,
                    size: upload.size,
                    business_permits: savedBusinessPermits
                }));
                await queryRunner.manager.save('uploads', uploadsPayload);
            }

            await queryRunner.commitTransaction();
            return { message: "Pengajuan Berhasil Dibuat" }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error Submit Data: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createBusinessPermitsHistoryWithTransaction(
        queryRunner: QueryRunner,
        businessPermits: BusinessPermits,
        stepProgress: StepProgress,
        notes: string,
    ) {
        const businessPermitsHistory = this.businessPermitsHistoryRepository.create({
            business_permits: businessPermits,
            step_progress: stepProgress,
            notes,
        });
        await queryRunner.manager.save(businessPermitsHistory);
    }

    async delete(id: string): Promise<void> {
        try {
            await this.businessPermitsRepository.delete(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async update(id: string, body: UpsertBusinessPermitsDto): Promise<{ message: string }> {
        const queryRunner =
        this.businessPermitsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find step progress and contract
            const stepProgress = await this.stepProgressService.findById(body.step_progress_id);
            const businessPermits = await this.findById(id);

            // check when user doesnt has permission update contract on step group
            // const isAdmin = contract.user.roles.some(role => role.name === 'admin');
            // if (!isAdmin) {
            //     const allowedSlugs = ['data-kurang', 'review-user'];
            //     if (!allowedSlugs.includes(contract.step_progress.slug)) {
            //         throw new HttpException('You do not have permission to update this contract at its current stage', 403);
            //     }
            // }

            body.step_progress_id = undefined;

            // update contract data
            await this.businessPermitsRepository.update(id, {
                ...body,
                step_progress: stepProgress,
            });

            // insert contract history data
            await this.createBusinessPermitsHistoryWithTransaction(queryRunner, businessPermits, stepProgress, body.notes);

            await queryRunner.commitTransaction();
            return { message: "Pengajuan Berhasil Diperbarui" }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error Update Data: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async uploads(id: string, uploadsData: CreateUploadsDto[], userId: UuidParamDto): Promise<{ message: string }> {
        try {
            const businessPermits = await this.findById(id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.business_permits = businessPermits;
                return newUpload;
            });
            await this.uploadsService.createMany(uploadsPayload, userId);
            return { message: "File Berhasil Ditambahkan" }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async uploadsByCurrentUser(id: string, uploadsData: CreateUploadsDto[], userId: UuidParamDto): Promise<{ message: string }> {
        try {
            const businessPermits = await this.findByIdByCurrentUser(id, userId.id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.business_permits = businessPermits;
                return newUpload;   
            });
            await this.uploadsService.createMany(uploadsPayload, userId);
            return { message: "File Berhasil Ditambahkan" }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
