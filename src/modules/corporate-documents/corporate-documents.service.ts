import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, In, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { CorporateDocuments } from './entities/corporate-documents.entity';
import { CorporateDocumentsHistory } from './entities/corporate-documents-history.entity';
import { StepProgressService } from '../step-progress/step-progress.service';
import { UserService } from '../user/user.service';
import { UploadsService } from '../uploads/uploads.service';
import { FilterCorporateDocumentsDto } from './dto/filter-corporate-documents.dto';
import moment from 'moment';
import { FilterContractDto } from '../contract/dto/filter-contract.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UpsertCorporateDocumentsDto } from './dto/upsert-corporate-documents.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { User } from '../user/entities/user.entity';
import { StepProgress } from '../step-progress/entities/step-progress.entity';

@Injectable()
export class CorporateDocumentsService {
    private readonly logger = new Logger(CorporateDocumentsService.name);

    constructor(
        @InjectRepository(CorporateDocuments)
        private corporateDocumentsRepository: Repository<CorporateDocuments>,
        @InjectRepository(CorporateDocumentsHistory)
        private corporateDocumentsHistoryRepository: Repository<CorporateDocumentsHistory>,
        private stepProgressService: StepProgressService,
        private userService: UserService,
        private uploadsService: UploadsService,
    ) {}

    async findAll(query: FilterCorporateDocumentsDto) {
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
            const queryOptions: FindManyOptions<CorporateDocuments> = {
                relations: ['step_progress'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    corporate_documents_number: true,
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
            const corporateDocuments = await this.corporateDocumentsRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.corporateDocumentsRepository.count({
                where: whereConditions
            }) : corporateDocuments.length;

            return {
                data: corporateDocuments,
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
            const queryOptions: FindManyOptions<CorporateDocuments> = {
                relations: ['step_progress', 'user'],
                order: {
                    created_at: 'DESC' as const
                },
                select: {
                    id: true,
                    title: true,
                    corporate_documents_number: true,
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
            const corporateDocuments = await this.corporateDocumentsRepository.find(queryOptions);
            
            // Get total count for pagination if needed
            const total = !viewAll ? await this.corporateDocumentsRepository.count({
                where: whereConditions
            }) : corporateDocuments.length;

            return {
                data: corporateDocuments,
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
            const corporateDocument = await this.corporateDocumentsRepository.findOne({
                where: {
                    id: id,
                    user: { id: userId },
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            return corporateDocument;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const corporateDocument = await this.corporateDocumentsRepository.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                },
                relations: ['step_progress', 'uploads', 'user'],
            });

            if (!corporateDocument) {
                throw new NotFoundException('Corporate document not found');
            }

            return corporateDocument;

        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async findByUser(
        user: IUserRequest,
        query: PaginationDto,
    ) : Promise<{ data: CorporateDocuments[]; total: number }>{
        try {
            const { page, limit, search, viewAll } = query;
            const skip = (page - 1) * limit;

            const queryBuilder = this.corporateDocumentsRepository
                .createQueryBuilder('corporate_documents')
                .leftJoinAndSelect('corporate_documents.user', 'user')
                .where('corporate_documents.user.id = :user', { user: user.id })
                .select([
                    'corporate_documents.id',
                    'corporate_documents.title',
                    'corporate_documents.document_number',
                    'corporate_documents.description',
                    'corporate_documents.start_date',
                    'corporate_documents.end_date',
                    'corporate_documents.notes',
                    'corporate_documents.created_at',
                ]);

            if (search) {
                queryBuilder.where('corporate_documents.document_number ILIKE :search', {
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

    async create(body: UpsertCorporateDocumentsDto, userId: UuidParamDto, uploadsData: CreateUploadsDto[]) {
        const queryRunner =
        this.corporateDocumentsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find user and step progress
            const user: User = await this.userService.findUserById(userId);
            const stepProgress = await this.stepProgressService.findBySlug("mulai");

            // insert corporate document data
            const corporateDocument = this.corporateDocumentsRepository.create({
                ...body,
                step_progress: stepProgress,
                user: user,
            });
            const savedCorporateDocument = await queryRunner.manager.save(corporateDocument);

            // insert corporate document history data
            await this.createCorporateDocumentsHistoryWithTransaction(queryRunner, savedCorporateDocument, stepProgress, "Document Created");

            // insert uploads data within transaction
            if (uploadsData && uploadsData.length > 0) {
                const uploadsPayload = uploadsData.map((upload) => ({
                    originalName: upload.originalName,
                    path: upload.path,
                    size: upload.size,
                    corporate_documents: savedCorporateDocument
                }));
                await queryRunner.manager.save('uploads', uploadsPayload);
            }

            await queryRunner.commitTransaction();
            return { message: "Document Successfully Created" }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error Submit Data: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createCorporateDocumentsHistoryWithTransaction(
        queryRunner: QueryRunner,
        corporateDocument: CorporateDocuments,
        stepProgress: StepProgress,
        notes: string,
    ) {
        const corporateDocumentHistory = this.corporateDocumentsHistoryRepository.create({
            corporate_documents: corporateDocument,
            step_progress: stepProgress,
            notes,
        });
        await queryRunner.manager.save(corporateDocumentHistory);
    }

    async delete(id: string): Promise<void> {
        try {
            await this.corporateDocumentsRepository.delete(id);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async update(id: string, body: UpsertCorporateDocumentsDto): Promise<{ message: string }> {
        const queryRunner =
        this.corporateDocumentsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // find step progress and corporate document
            const stepProgress = await this.stepProgressService.findById(body.step_progress_id);
            const corporateDocument = await this.findById(id);

            body.step_progress_id = undefined;

            // update corporate document data
            await this.corporateDocumentsRepository.update(id, {
                ...body,
                step_progress: stepProgress,
            });

            // insert corporate document history data
            await this.createCorporateDocumentsHistoryWithTransaction(queryRunner, corporateDocument, stepProgress, body.notes);

            await queryRunner.commitTransaction();
            return { message: "Document Successfully Updated" }
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
            const corporateDocument = await this.findById(id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.corporate_documents = corporateDocument;
                return newUpload;
            });
            await this.uploadsService.createMany(uploadsPayload, userId);
            return { message: "File Successfully Added" }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async uploadsByCurrentUser(id: string, uploadsData: CreateUploadsDto[], userId: UuidParamDto): Promise<{ message: string }> {
        try {
            const corporateDocument = await this.findByIdByCurrentUser(id, userId.id);
            const uploadsPayload = uploadsData.map((upload) => {
                const newUpload = new CreateUploadsDto();
                newUpload.originalName = upload.originalName;
                newUpload.path = upload.path;
                newUpload.size = upload.size;
                newUpload.corporate_documents = corporateDocument;
                return newUpload;   
            });
            await this.uploadsService.createMany(uploadsPayload, userId);
            return { message: "File Successfully Added" }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
