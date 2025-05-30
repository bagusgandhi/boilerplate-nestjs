import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { 
    In, 
    LessThan, 
    MoreThan,
    QueryRunner, 
    Repository, 
    FindManyOptions, 
    ILike
} from 'typeorm';
import { ContractHistory } from './entities/contract-history.entity';
import { UpsertContractDto } from './dto/upsert-contract.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { StepProgressService } from '../step-progress/step-progress.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { UploadsService } from '../uploads/uploads.service';
import { StepProgress } from '../step-progress/entities/step-progress.entity';
import { FilterContractDto } from './dto/filter-contract.dto';
import * as moment from 'moment';

@Injectable()
export class ContractService {
    private readonly logger = new Logger(ContractService.name);

    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractHistory)
        private contractHistoryRepository: Repository<ContractHistory>,
        private stepProgressService: StepProgressService,
        private userService: UserService,
        private uploadsService: UploadsService,
    ) {}

    async findAll(query: FilterContractDto) {
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
            const queryOptions: FindManyOptions<Contract> = {
                relations: ['step_progress'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    contract_number: true,
                    description: true,
                    scopes: true,
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
                whereConditions.contract_number = ILike(`%${search}%`);
            }

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
            const contracts = await this.contractRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.contractRepository.count({
                where: whereConditions
            }) : contracts.length;

            return {
                data: contracts,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: !viewAll ? Math.ceil(total / limit) : 1
            };

        } catch (error) {
            this.logger.error('Error in findAll:', error);
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
            const queryOptions: FindManyOptions<Contract> = {
                relations: ['step_progress', 'user'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    contract_number: true,
                    description: true,
                    scopes: true,
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
            const contracts = await this.contractRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.contractRepository.count({
                where: whereConditions
            }) : contracts.length;

            return {
                data: contracts,
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
            const contract = await this.contractRepository.findOne({
                where: {
                    id: id,
                    user: { id: userId },
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            return contract;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const contract = await this.contractRepository.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            if (!contract) {
                throw new NotFoundException('Contract not found');
            }

            return contract;
            
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findByUser(
        user: IUserRequest,
        query: PaginationDto,
    ) : Promise<{ data: Contract[]; total: number }>{
        try {
            const { page, limit, search, viewAll } = query;
            const skip = (page - 1) * limit;

            const queryBuilder = this.contractRepository
                .createQueryBuilder('contract')
                .leftJoinAndSelect('contract.user', 'user')
                .where('contract.user.id = :user', { user: user.id })
                .select([
                    'contract.id',
                    'contract.title',
                    'contract.contract_number',
                    'contract.description',
                    'contract.scopes',
                    'contract.start_date',
                    'contract.end_date',
                    'contract.notes',
                    'contract.created_at',
                ]);

            if (search) {
                queryBuilder.where('contract.contract_number ILIKE :search', {
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

    async create(body: UpsertContractDto, userId: UuidParamDto, uploadsData: CreateUploadsDto[]) {
        const queryRunner =
        this.contractRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find user and step progress
            const user: User = await this.userService.findUserById(userId);
            const stepProgress = await this.stepProgressService.findBySlug("mulai");

            // insert contract data
            const contract = this.contractRepository.create({
                ...body,
                step_progress: stepProgress,
                user: user,
            });
            const savedContract = await queryRunner.manager.save(contract);

            //  insert contract history data
            await this.createContractHistoryWithTransaction(queryRunner, savedContract, stepProgress, "Pengajuan Dibuat");

            // insert uploads data within transaction
            if (uploadsData && uploadsData.length > 0) {
                const uploadsPayload = uploadsData.map((upload) => ({
                    originalName: upload.originalName,
                    path: upload.path,
                    size: upload.size,
                    contract: savedContract
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

    async createContractHistoryWithTransaction(
        queryRunner: QueryRunner,
        contract: Contract,
        stepProgress: StepProgress,
        notes: string,
    ) {
        const contractHistory = this.contractHistoryRepository.create({
            contract,
            step_progress: stepProgress,
            notes,
        });
        await queryRunner.manager.save(contractHistory);
    }

    async delete(id: string): Promise<void> {
        try {
            await this.contractRepository.delete(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async update(id: string, body: UpsertContractDto): Promise<{ message: string }> {
        const queryRunner =
        this.contractRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find step progress and contract
            const stepProgress = await this.stepProgressService.findById(body.step_progress_id);
            const contract = await this.findById(id);

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
            await this.contractRepository.update(id, {
                ...body,
                step_progress: stepProgress,
            });

            // insert contract history data
            await this.createContractHistoryWithTransaction(queryRunner, contract, stepProgress, body.notes);

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
            const contract = await this.findById(id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.contract = contract;
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
            const contract = await this.findByIdByCurrentUser(id, userId.id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.contract = contract;
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
