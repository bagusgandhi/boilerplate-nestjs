import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, FindManyOptions, ILike, In, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { BusinessPermits } from './entities/business-permits.entity';
import { StepProgressService } from '../step-progress/step-progress.service';
import { UserService } from '../user/user.service';
import { UploadsService } from '../uploads/uploads.service';
import { FilterBusinessPermitsDto } from './dto/filter-business-permits.dto';
import * as moment from 'moment';
import { FilterContractDto } from '../contract/dto/filter-contract.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UpsertBusinessPermitsDto } from './dto/upsert-business-permits.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { User } from '../user/entities/user.entity';
import { StepProgress } from '../step-progress/entities/step-progress.entity';
import { BusinessPermitsHistory } from './entities/business-permits-history.entity';
import { promisify } from 'util';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { pipeline } from 'stream';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

const pipelineAsync = promisify(pipeline);


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
        private notificationsService: NotificationsService
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

            // Start building the query with QueryBuilder
            const queryBuilder = this.businessPermitsRepository.createQueryBuilder('business_permit')
                .leftJoinAndSelect('business_permit.step_progress', 'step_progress')
                .orderBy('business_permit.created_at', 'DESC');  // Order by created_at DESC

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('business_permit.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('business_permit.business_permits_number ILIKE :search', { search: `%${search}%` });
                    })
                );
            }

            if (step_progress_id) {
                queryBuilder.andWhere('step_progress.id IN (:...step_progress_id)', { step_progress_id });
            }

            // Handle date range filtering using moment.js
            if (start_date) {
                const startOfDay = moment(start_date).startOf('day').toDate();
                queryBuilder.andWhere('business_permit.start_date > :start_date', { start_date: startOfDay });
            }

            if (end_date) {
                const endOfDay = moment(end_date).endOf('day').toDate();
                queryBuilder.andWhere('business_permit.end_date < :end_date', { end_date: endOfDay });
            }

            // If viewAll is false, exclude deleted records
            if (!viewAll) {
                queryBuilder.andWhere('business_permit.deletedAt IS NULL');
            }

            // Apply pagination
            if (!viewAll) {
                queryBuilder.skip(page * limit).take(limit);
            }

            // Execute the query to get the filtered business permits
            const businessPermits = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : businessPermits.length;

            return {
                data: businessPermits,
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

    async findAllApproved(query: FilterBusinessPermitsDto) {
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

            // Start building the query with QueryBuilder
            const queryBuilder = this.businessPermitsRepository.createQueryBuilder('business_permit')
                .leftJoinAndSelect('business_permit.step_progress', 'step_progress')
                .where('step_progress.slug = :slug', { slug: 'selesai' }) // Only get contracts with step_progress slug 'selesai'
                .orderBy('business_permit.start_date', 'DESC', 'NULLS LAST');  // Order by created_at DESC

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('business_permit.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('business_permit.business_permits_number ILIKE :search', { search: `%${search}%` })
                            .orWhere('business_permit.description ILIKE :search', { search: `%${search}%` });
                    })
                );
            }

            if (step_progress_id) {
                queryBuilder.andWhere('step_progress.id IN (:...step_progress_id)', { step_progress_id });
            }

            // Apply start_period_year condition if provided
            if (start_period_year) {
                const startDate = new Date(`${start_period_year}-01-01`);
                const endDate = new Date(`${start_period_year}-12-31`);
                queryBuilder.andWhere('business_permit.start_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply end_period_year condition if provided
            if (end_period_year) {
                const startDate = new Date(`${end_period_year}-01-01`);
                const endDate = new Date(`${end_period_year}-12-31`);
                queryBuilder.andWhere('business_permit.end_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply reminder_period_year condition if provided
            if (reminder_period_year) {
                const startDate = new Date(`${reminder_period_year}-01-01`);
                const endDate = new Date(`${reminder_period_year}-12-31`);
                queryBuilder.andWhere('business_permit.reminder_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // If viewAll is false, exclude deleted records
            if (!viewAll) {
                queryBuilder.andWhere('business_permit.deletedAt IS NULL');
            }

            // Apply pagination
            if (!viewAll) {
                queryBuilder.skip(page * limit).take(limit);
            }

            // Execute the query to get the filtered business permits
            const businessPermits = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : businessPermits.length;

            return {
                data: businessPermits,
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
            await this.createBusinessPermitsHistoryWithTransaction(queryRunner, savedBusinessPermits, stepProgress, "Pengajuan Dibuat");

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
        
        const parsedDate = moment(dateStr, ['DD MMM YYYY', 'DD MMMM YYYY', 'DD-MMM-YY', 'DD/MM/YYYY', 'DD-MMM-YYYY']);
        return parsedDate.isValid() ? parsedDate : null;
    }
    
    // 16-Apr-15

    async bulkImportCsv(filePath: string, userId: UuidParamDto): Promise<void> {
        const results: BusinessPermits[] = [];
        const batchSize = 10000;

        // find step progress slug == selesai
        const stepProgress = await this.stepProgressService.findBySlug("selesai");

        try {

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

                        const businessPermit = new BusinessPermits();
                        businessPermit.title = sanitizedRow["JENIS-JENIS DOKUMEN"];
                        businessPermit.business_permits_number = sanitizedRow["NOMOR SURAT"];

                        const startDate = this.parseDate(sanitizedRow["TANGGAL TERBIT"]);
                        !startDate ? businessPermit.start_date = null : businessPermit.start_date = startDate.toDate();

                        // Validate reminder_date
                        const reminderDate = this.parseDate(sanitizedRow["REMIND"]);
                        !reminderDate ? businessPermit.reminder_date = null : businessPermit.reminder_date = reminderDate.toDate();

                        // Validate end_date (exither English or Indonesian month)
                        const endDate = this.parseDate(sanitizedRow["TANGGAL HABIS"]);
                        !endDate ? businessPermit.end_date = null : businessPermit.end_date = endDate.toDate();

                        businessPermit.description = sanitizedRow["KETERANGAN"];
                        businessPermit.user = { id: userId.id } as User; // Set user from request
                        businessPermit.step_progress = stepProgress; // Set step progress to "selesai"

                        results.push(businessPermit);

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

            console.log(`CSV file processed successfully. Total records: ${results}`);
        } catch (error) {
            this.logger.error('Error importing CSV file', error);
            throw error;
        }
    }

    async saveBatch(results: BusinessPermits[]): Promise<void> {
        const queryBuilder = this.businessPermitsRepository.createQueryBuilder();

        // Prepare the values to be upserted
        const values = results.map(item => ({
            title: item.title,
            business_permits_number: item.business_permits_number,
            start_date: item.start_date,
            reminder_date: item.reminder_date,
            end_date: item.end_date,
            description: item.description,
            step_progress: item.step_progress,
            user: item.user,
        }));

        try {
            // Perform the bulk upsert using ON CONFLICT for PostgreSQL
            await queryBuilder
                .insert()
                .into(BusinessPermits)
                .values(values)
            //     .onConflict(`("business_permits_number") DO UPDATE SET
            //   "title" = EXCLUDED."title",
            //   "start_date" = EXCLUDED."start_date",
            //   "reminder_date" = EXCLUDED."reminder_date",
            //   "end_date" = EXCLUDED."end_date",
            //   "description" = EXCLUDED."description"`)
                .execute();

            console.log(`Successfully saved batch of ${values.length} records.`);
        } catch (error) {
            console.error('Error during bulk upsert:', error);
            throw error;
        }
    }

    @Cron('0 0 8 * * *') // cron every at 08:00:00 AM
    async cronScheduleReminderBusinessPermits() {
        try {
            // filter reminder date range today and tomorrow
            const today = moment().startOf('day').toDate();
            const tomorrow = moment().add(1, 'day').startOf('day').toDate();
            const businessPermitsData = await this.businessPermitsRepository.find({
                where: {
                    reminder_date: Between(today, tomorrow),
                    deletedAt: null,
                },
                relations: ['user'],
            });

            // find all user when role is Department Legal
            const users: User[] = await this.userService.findAllByRoleName(["Department Legal"]);

            if (businessPermitsData.length === 0) {
                this.logger.log('No business permits data found with reminder date today or tomorrow.');
                return;
            } else {
                // Send reminder emails
                for (const businessPermit of businessPermitsData) {
                    for (const user of users) {
                        this.notificationsService.addQueueEmail({
                            to: user.email,
                            subject: `Reminder: Perizinan Segera Berakhir`,
                            templateName: 'reminder',
                            context: {
                                userName: user.name,
                                title: businessPermit.title,
                                url: `http://localhost:3001/dashboard/perjanjian/${businessPermit.id}`,
                                number: businessPermit.business_permits_number,
                                type: 'Perizinan',
                                description: businessPermit.description,
                                reminder_date: moment(businessPermit.reminder_date).format('DD MMMM YYYY'),
                            },
                        });
                    }
                }
            }

        } catch (error) {
            this.logger.log('Error in cronScheduleReminderBusinessPermits:', error);
            throw error;
        }
    }

}
