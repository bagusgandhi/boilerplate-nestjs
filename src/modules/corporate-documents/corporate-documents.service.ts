import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, FindManyOptions, ILike, In, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { CorporateDocuments } from './entities/corporate-documents.entity';
import { CorporateDocumentsHistory } from './entities/corporate-documents-history.entity';
import { StepProgressService } from '../step-progress/step-progress.service';
import { UserService } from '../user/user.service';
import { UploadsService } from '../uploads/uploads.service';
import { FilterCorporateDocumentsDto } from './dto/filter-corporate-documents.dto';
import * as moment from 'moment';
import { FilterContractDto } from '../contract/dto/filter-contract.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UpsertCorporateDocumentsDto } from './dto/upsert-corporate-documents.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { User } from '../user/entities/user.entity';
import { StepProgress } from '../step-progress/entities/step-progress.entity';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron } from '@nestjs/schedule';

const pipelineAsync = promisify(pipeline);


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
        private notificationsService: NotificationsService, // Assuming you have a NotificationsService for email notifications
    ) { }

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

            // Start building the query
            const queryBuilder = this.corporateDocumentsRepository.createQueryBuilder('cd')
                .leftJoinAndSelect('cd.step_progress', 'step_progress')
                .orderBy('cd.created_at', 'DESC')
                .select([
                    'cd.id',
                    'cd.title',
                    'cd.corporate_documents_number',
                    'cd.description',
                    'cd.start_date',
                    'cd.end_date',
                    'cd.reminder_date',
                    'cd.notes',
                    'cd.created_at'
                ]);

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('cd.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('cd.corporate_documents_number ILIKE :search', { search: `%${search}%` });
                    })
                );
            }

            if (step_progress_id) {
                queryBuilder.andWhere('cd.step_progress_id IN (:...step_progress_id)', { step_progress_id });
            }

            if (start_date) {
                const startOfDay = moment(start_date).startOf('day').toDate();
                queryBuilder.andWhere('cd.start_date > :start_date', { start_date: startOfDay });
            }

            if (end_date) {
                const endOfDay = moment(end_date).endOf('day').toDate();
                queryBuilder.andWhere('cd.end_date < :end_date', { end_date: endOfDay });
            }

            if (!viewAll) {
                queryBuilder.andWhere('cd.deletedAt IS NULL');
                queryBuilder.skip(page * limit).take(limit);
            }

            // Execute the query and get the results
            const corporateDocuments = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : corporateDocuments.length;

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

    async findAllApproved(query: FilterCorporateDocumentsDto) {
        try {
            const {
                search,
                step_progress_id,
                start_period_year,
                end_period_year,
                reminder_period_year,
                viewAll,
                page = 0,
                limit = 10
            } = query;

            // Start building the query
            const queryBuilder = this.corporateDocumentsRepository.createQueryBuilder('cd')
                .leftJoinAndSelect('cd.step_progress', 'step_progress')
                .where('step_progress.slug = :slug', { slug: 'selesai' }) // Only get contracts with step_progress slug 'selesai'
                .orderBy('cd.created_at', 'DESC')
                .select([
                    'cd.id',
                    'cd.title',
                    'cd.corporate_documents_number',
                    'cd.description',
                    'cd.start_date',
                    'cd.end_date',
                    'cd.reminder_date',
                    'cd.notes',
                    'cd.created_at'
                ]);

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('cd.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('cd.corporate_documents_number ILIKE :search', { search: `%${search}%` });
                    })
                );
            }

            if (step_progress_id) {
                queryBuilder.andWhere('cd.step_progress_id IN (:...step_progress_id)', { step_progress_id });
            }

            // Apply start_period_year condition if provided
            if (start_period_year) {
                const startDate = new Date(`${start_period_year}-01-01`);
                const endDate = new Date(`${start_period_year}-12-31`);
                queryBuilder.andWhere('cd.start_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply end_period_year condition if provided
            if (end_period_year) {
                const startDate = new Date(`${end_period_year}-01-01`);
                const endDate = new Date(`${end_period_year}-12-31`);
                queryBuilder.andWhere('cd.end_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply reminder_period_year condition if provided
            if (reminder_period_year) {
                const startDate = new Date(`${reminder_period_year}-01-01`);
                const endDate = new Date(`${reminder_period_year}-12-31`);
                queryBuilder.andWhere('cd.reminder_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            if (!viewAll) {
                queryBuilder.andWhere('cd.deletedAt IS NULL');
                queryBuilder.skip(page * limit).take(limit);
            }

            // Execute the query and get the results
            const corporateDocuments = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : corporateDocuments.length;

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


    async findAllByCurrentUser(query: FilterCorporateDocumentsDto, userId: string) {
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
                    reminder_date: true,
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
    ): Promise<{ data: CorporateDocuments[]; total: number }> {
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
                    'corporate_documents.reminder_date',
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

    parseDate(dateStr: string): any {
        const indonesianMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        let locale = 'en';
        for (const month of indonesianMonths) {
            if (dateStr.includes(month)) {
                locale = 'id';
                break;
            }
        }

        moment.locale(locale);
        this.logger.log(dateStr);

        // Try to parse using moment with multiple common formats
        const parsedDate = moment(dateStr, moment.ISO_8601, true); // Attempt to parse with ISO 8601 first

        // Check if the parsed date is valid
        if (!parsedDate.isValid()) {
            // If ISO_8601 fails, try auto-detection (moment tries to guess the format)
            const parsedDateAuto = moment(dateStr);
            return parsedDateAuto.isValid() ? parsedDateAuto : null;
        }

        return parsedDate.isValid() ? parsedDate : null;
    }

    async bulkImportCsv(filePath: string, userId: UuidParamDto): Promise<void> {
        const results: CorporateDocuments[] = [];
        const batchSize = 10000;

        try {

            // find step progress by slug === selesao
            const stepProgress = await this.stepProgressService.findBySlug("selesai");


            await pipelineAsync(
                fs.createReadStream(filePath),
                csvParser(),
                async (source: NodeJS.ReadableStream) => {
                    for await (const row of source) {

                        // Sanitize keys to avoid issues with spaces in CSV headers
                        const sanitizedRow = Object.keys(row).reduce((acc, key) => {
                            acc[key.trim()] = row[key];
                            return acc;
                        }, {});


                        const corporateDocuments = new CorporateDocuments();
                        corporateDocuments.title = sanitizedRow["JENIS DOKUMEN"];
                        corporateDocuments.corporate_documents_number = sanitizedRow["NOMOR SURAT"];

                        // Handle start_date dynamically (either English or Indonesian month)
                        const startDate = this.parseDate(sanitizedRow["TANGGAL DIKELUARKAN"]);
                        !startDate ? corporateDocuments.start_date = null : corporateDocuments.start_date = startDate.toDate();

                        // Validate reminder_date
                        const reminderDate = this.parseDate(sanitizedRow["REMIND"]);
                        !reminderDate ? corporateDocuments.reminder_date = null : corporateDocuments.reminder_date = reminderDate.toDate();

                        // Validate end_date (exither English or Indonesian month)
                        const endDate = this.parseDate(sanitizedRow["TANGGAL EXPIRED"]);
                        !endDate ? corporateDocuments.end_date = null : corporateDocuments.end_date = endDate.toDate();

                        corporateDocuments.description = sanitizedRow["KETERANGAN"];
                        corporateDocuments.notary = sanitizedRow["NOTARIS"];
                        corporateDocuments.user = { id: userId.id } as User; // Set user from request
                        corporateDocuments.step_progress = stepProgress;


                        this.logger.log(`Parsed corporate document: ${JSON.stringify(corporateDocuments)}`);

                        results.push(corporateDocuments);

                        // If batch size reached, save the results and reset
                        if (results.length >= batchSize) {
                            await this.saveBatch(results); // Call bulk upsert here
                            results.length = 0;  // Clear the results array after saving
                        }
                    }
                }
            );

            // Save any remaining results after processing the file
            if (results.length > 0) {
                await this.saveBatch(results);
            }
        } catch (error) {
            this.logger.error('Error importing CSV file', error);
            throw error;
        }
    }

    async saveBatch(results: CorporateDocuments[]): Promise<void> {
        const queryBuilder = this.corporateDocumentsRepository.createQueryBuilder();

        // Prepare the values to be upserted
        const values = results.map(item => ({
            title: item.title,
            corporate_documents_number: item.corporate_documents_number,
            start_date: item.start_date,
            reminder_date: item.reminder_date,
            end_date: item.end_date,
            description: item.description,
            step_progress: item.step_progress,
            user: item.user,
            notary: item.notary
        }));

        // console.log(values[0])

        try {
            // Perform the bulk upsert using ON CONFLICT for PostgreSQL
            await queryBuilder
                .insert()
                .into(CorporateDocuments)
                .values(values)
                .execute();

            console.log(`Successfully saved batch of ${values.length} records.`);
        } catch (error) {
            console.error('Error during bulk upsert:', error);
            throw error;
        }
    }

    @Cron('0 30 8 * * *') // cron every at 08:00:00 AM
    async cronScheduleReminderCorporateDocuments() {
        try {
            // filter reminder date range today and tomorrow
            const today = moment().startOf('day').toDate();
            const tomorrow = moment().add(1, 'day').startOf('day').toDate();
            const corporateDocuments = await this.corporateDocumentsRepository.find({
                where: {
                    reminder_date: Between(today, tomorrow),
                    deletedAt: null,
                },
                relations: ['user'],
            });

            // find all user when role is Department Legal
            const users: User[] = await this.userService.findAllByRoleName(["Department Legal"]);

            if (corporateDocuments.length === 0) {
                this.logger.log('No corporate document data found with reminder date today or tomorrow.');
                return;
            } else {
                // Send reminder emails
                for (const corporateDocument of corporateDocuments) {
                    for (const user of users) {
                        this.notificationsService.addQueueEmail({
                            to: user.email,
                            subject: `Reminder: AKTA RUPS Segera Berakhir`,
                            templateName: 'reminder',
                            context: {
                                userName: user.name,
                                title: corporateDocument.title,
                                url: `http://localhost:3001/dashboard/perjanjian/${corporateDocument.id}`,
                                number: corporateDocument.corporate_documents_number,
                                type: 'AKTA RUPS',
                                description: corporateDocument.description,
                                reminder_date: moment(corporateDocument.reminder_date).format('DD MMMM YYYY'),
                            },
                        });
                    }
                }
            }

        } catch (error) {
            this.logger.log('Error in cronScheduleReminderCorporateDocuments:', error);
            throw error;
        }
    }
}
