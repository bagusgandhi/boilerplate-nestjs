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
    Brackets,
    Between
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
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { ContractApproval } from './entities/contract-approval.entity';
import { AddApprovalDto } from './dto/add-approval.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ProcessDto } from './dto/process.dto';
import { Cron } from '@nestjs/schedule';

const pipelineAsync = promisify(pipeline);

@Injectable()
export class ContractService {
    private readonly logger = new Logger(ContractService.name);

    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractHistory)
        private contractHistoryRepository: Repository<ContractHistory>,
        @InjectRepository(ContractApproval)
        private contractApprovalRepository: Repository<ContractApproval>,
        private stepProgressService: StepProgressService,
        private userService: UserService,
        private uploadsService: UploadsService,
        private notificationsService: NotificationsService
    ) {}

    async findAll(query: FilterContractDto) {
        try {
            const {
                search,
                step_progress_id,
                start_period_year,
                end_period_year,
                reminder_period_year,
                start_date,
                end_date,
                viewAll,
                page = 0,
                limit = 10
            } = query;

            // Start building the query with QueryBuilder
            const queryBuilder = this.contractRepository.createQueryBuilder('contract')
                .leftJoinAndSelect('contract.step_progress', 'step_progress')
                .leftJoinAndSelect('contract.user', 'user')
                .leftJoinAndSelect('contract.contract_approvals', 'contract_approvals')
                .leftJoinAndSelect('contract_approvals.user', 'contract_approval_user')
                .where('step_progress.slug != :slug', { slug: 'selesai' })
                .orderBy('contract.created_at', 'DESC');  // Order by created_at DESC

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('contract.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('contract.contract_number ILIKE :search', { search: `%${search}%` });
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
                queryBuilder.andWhere('contract.start_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply end_period_year condition if provided
            if (end_period_year) {
                const startDate = new Date(`${end_period_year}-01-01`);
                const endDate = new Date(`${end_period_year}-12-31`);
                queryBuilder.andWhere('contract.end_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply reminder_period_year condition if provided
            if (reminder_period_year) {
                const startDate = new Date(`${reminder_period_year}-01-01`);
                const endDate = new Date(`${reminder_period_year}-12-31`);
                queryBuilder.andWhere('contract.reminder_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // If viewAll is false, exclude deleted records
            if (!viewAll) {
                queryBuilder.andWhere('contract.deletedAt IS NULL');
            }

            // Apply pagination
            if (!viewAll) {
                queryBuilder.skip(page * limit).take(limit);
            }

            // Execute the query to get the filtered contracts
            const contracts = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : contracts.length;

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

    async findAllApproved(query: FilterContractDto) {
        try {
            const {
                search,
                start_period_year,
                end_period_year,
                reminder_period_year,
                viewAll,
                page = 0,
                limit = 10
            } = query;

            // Start building the query with QueryBuilder
            const queryBuilder = this.contractRepository.createQueryBuilder('contract')
                .leftJoinAndSelect('contract.step_progress', 'step_progress')
                .leftJoinAndSelect('contract.user', 'user')
                .leftJoinAndSelect('contract.contract_approvals', 'contract_approvals')
                .leftJoinAndSelect('contract_approvals.user', 'contract_approval_user')
                .where('step_progress.slug = :slug', { slug: 'selesai' }); // Only get contracts with step_progress slug 'selesai'

            // Apply search condition if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets(qb => {
                        qb.where('contract.title ILIKE :search', { search: `%${search}%` })
                            .orWhere('contract.contract_number ILIKE :search', { search: `%${search}%` });
                    })
                );
            }

            // Apply start_period_year condition if provided
            if (start_period_year) {
                const startDate = new Date(`${start_period_year}-01-01`);
                const endDate = new Date(`${start_period_year}-12-31`);
                queryBuilder.andWhere('contract.start_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply end_period_year condition if provided
            if (end_period_year) {
                const startDate = new Date(`${end_period_year}-01-01`);
                const endDate = new Date(`${end_period_year}-12-31`);
                queryBuilder.andWhere('contract.end_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply reminder_period_year condition if provided
            if (reminder_period_year) {
                const startDate = new Date(`${reminder_period_year}-01-01`);
                const endDate = new Date(`${reminder_period_year}-12-31`);
                queryBuilder.andWhere('contract.reminder_date BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });
            }

            // Apply the viewAll condition
            if (!viewAll) {
                queryBuilder.andWhere('contract.deletedAt IS NULL');
            }

            // Apply pagination
            if (!viewAll) {
                queryBuilder.skip(page * limit).take(limit);
            }

            // sort by started_date DESC null last
            queryBuilder.orderBy('contract.start_date', 'DESC', 'NULLS LAST');

            // Execute the query
            const contracts = await queryBuilder.getMany();

            // Get total count for pagination if needed
            const total = !viewAll ? await queryBuilder.getCount() : contracts.length;

            

            // Return paginated response
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
                relations: ['step_progress', 'user', 'contract_approvals', 'contract_approvals.user'], // Add contract_approval relation
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
                    user: {
                        id: true,
                        name: true,
                        email: true,
                    },
                    contract_approvals: {
                        id: true,
                        user: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                },
                where: []
            };
    
            // Build where conditions
            const whereConditions: any[] = [
                { user: { id: userId } },
                { contract_approvals: { id: userId } }
            ];
    
            // Add step_progress condition if needed
            if (step_progress_id) {
                whereConditions.push({ step_progress: { id: In(step_progress_id) } });
            }
    
            // Optimize date range queries using moment.js
            if (start_date) {
                const startOfDay = moment(start_date).startOf('day').toDate();
                whereConditions.push({ start_date: MoreThan(startOfDay) });
            }
    
            if (end_date) {
                const endOfDay = moment(end_date).endOf('day').toDate();
                whereConditions.push({ end_date: LessThan(endOfDay) });
            }
    
            // Handle deletedAt condition and pagination
            if (!viewAll) {
                whereConditions.push({ deletedAt: null });
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
                where: [
                    {
                        id: id,
                        user: { id: userId },
                        deletedAt: null,
                    },
                    {
                        id: id,
                        contract_approvals: { id: userId },
                        deletedAt: null,
                    }
                ],
                relations: ['step_progress', 'uploads', 'user', 'contract_approvals'],
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
                relations: ['step_progress', 'uploads', 'user', 'contract_approvals', 'contract_approvals.user'],
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

            // send notification to user when contract is created
            const usersLegal = await this.userService.findAllByRoleName(['Department Legal']);
            usersLegal.forEach((user) => {
                this.notificationsService.addQueueEmail({
                    to: user.email,
                    subject: 'Pengajuan Baru',
                    templateName: 'email-contract-notification',
                    context: {
                        title: savedContract.title,
                        contract_number: savedContract.contract_number,
                        userName: user.name,
                        description: savedContract.description,
                    },
                })
            })

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
            let stepProgress: StepProgress;
            const contract = await this.findById(id);

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

    async processContract(id: string, body: ProcessDto){
        const queryRunner =
            this.contractRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let stepProgress: StepProgress;
            const contract = await this.findById(id);

            switch (contract.step_progress.slug) {
                case 'mulai':   
                    stepProgress = await this.stepProgressService.findBySlug(body.approve ? 'proses-legal' : 'mulai');
                    if(body.approve){
                        // send notification to user when approve is true
                        this.notificationsService.addQueueEmail({
                            to: contract.user.email,
                            subject: 'Pengajuan Sedang Diproses',
                            templateName: 'email-contract-notification',
                            context: {
                                title: contract.title,
                                contract_number: contract.contract_number,
                                userName: contract.user.name,
                                description: contract.description,
                            },
                        })
                    }
                    break;

                case 'data-kurang':
                    stepProgress = await this.stepProgressService.findBySlug(body.approve ? 'proses-legal' : 'data-kurang');
                    if(body.approve){
                        // send notification to user when approve is true
                        this.notificationsService.addQueueEmail({
                            to: contract.user.email,
                            subject: 'Pengajuan Berhasil Diajukan Kembali',
                            templateName: 'email-contract-notification',
                            context: {
                                title: contract.title,
                                contract_number: contract.contract_number,
                                userName: contract.user.name,
                                description: contract.description,
                            },
                        })
                    }

                    //  else {
                    //     // send notification to user when approve is false
                    //     this.notificationsService.addQueueEmail({
                    //         to: contract.user.email,
                    //         subject: 'Pengajuan Ditolak, harap lengkapi data',
                    //         html: 'Pengajuan Ditolak, harap lengkapi data'
                    //     })
                    // }
                    
                    break;

                case 'review-user':
                    stepProgress = await this.stepProgressService.findBySlug(body.approve ? 'review-mitra' : 'proses-legal');

                    // send notification to mitra when approve is true
                    if (!body.approve) {
                        // call mailer service to send email notification


                    }
                    break;

                case 'proses-legal':
                    stepProgress = await this.stepProgressService.findBySlug(body.approve ? 'proses-legal' : 'data-kurang');

                    // send notification to mitra when reject is true
                    if (body.approve) {
                        // call mailer service to send email notification
                        this.notificationsService.addQueueEmail({
                            to: contract.user.email,
                            subject: 'Pengajuan Sedang dilakukan proses paraf',
                            templateName: 'email-contract-notification',
                            context: {
                                title: contract.title,
                                contract_number: contract.contract_number,
                                userName: contract.user.name,
                                description: contract.description,
                            },
                        })

                        const filteredAndSortedApprovals = contract.contract_approvals
                            ?.filter((item: ContractApproval) => item.type === 'paraf' && item.done === false)
                            .sort((a: ContractApproval, b: ContractApproval) => a.position - b.position)

                        if (filteredAndSortedApprovals && filteredAndSortedApprovals.length > 0) {
                            const firstItem = filteredAndSortedApprovals[0];
                            // this.notificationsService.addQueueEmail({
                            //     to: firstItem?.user?.email,
                            //     subject: `Hai ${firstItem?.user?.name}, Terdapat Dokumen Baru untuk Paraf`,
                            //     html: 'Pengajuan Sedang dilakukan proses paraf'
                            // });
                        }
                        
                    } else {
                        // this.notificationsService.addQueueEmail({
                        //     to: contract.user.email,
                        //     subject: 'Pengajuan Ditolak, harap lengkapi data',
                        //     html: 'Pengajuan Ditolak, harap lengkapi data'
                        // })
                    }
                    break;
                // case 'review-mitra':

                //     break;
                case 'selesai':
                    // insert ke table contract_approval

                    // notif ke user & dept legal

                    break;
                default:
                    throw new HttpException('Invalid step progress slug', 400);
            }

            // update contract data
            await this.contractRepository.update(id, {
                step_progress: stepProgress,
            });

            // insert contract history data
            await this.createContractHistoryWithTransaction(queryRunner, contract, stepProgress, body.notes);

            await queryRunner.commitTransaction();
            return { message: "Pengajuan Proses Berhasil Diperbarui" }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(error);
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

    async assignApprovalToContract(
        id: string, 
        body: AddApprovalDto
    ): Promise<{ message: string }> {
        try {
            const contractArr = await this.contractRepository.find({
                relations: ['contract_approvals'],
                where: { id }
            });
            const contract = contractArr[0];
            const position = (contract?.contract_approvals?.length ?? 0) + 1;
            const user = await this.userService.findUserById(body.user_id as any);

            this.logger.log(typeof position)
            
            const contractApproval = {
                user: user,
                type: body.type,
                contract: contract,
                position,
                done: false
            };
            await this.contractApprovalRepository.save(contractApproval);
            return { message: "Approval Berhasil Ditambahkan" }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async getApprovalByIdContract(id: string): Promise<ContractApproval[]> {
        try {
            const contract = await this.contractRepository.findOne({
                where: { id },
                relations: ['contract_approvals', 'contract_approvals.user'],
                select: {
                    contract_approvals: {   
                        id: true,
                        user: {
                            id: true,
                            name: true,
                            email: true,
                        },
                        type: true,
                        position: true,
                        done: true,
                    }

                }
            });

            if (!contract) {
                throw new NotFoundException('Contract not found');
            }

            return contract.contract_approvals;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async testQueueEmail() {
        // find all user email
        const users = await this.userService.findAll({
            page: 1,
            limit: 10,
            search: '',
            roleId: ''
        });

        // users?.results?.forEach((user) => {
        //     // console.log(user.email);
        //     this.notificationsService.addQueueEmail({
        //         to: user.email,
        //         subject: 'Test Email',
        //         // html: 'Test Email'
        //     })
        // });

        return users;



        // // send email to all user
        // for (const user of users.results) {
        //     await this.notificationsService.addQueueEmail({
        //         to: user.email,
        //         subject: 'Test Email',
        //         html: 'Test Email'
        //     })
        // }

        // return { message: "Email Berhasil Dikirim" }                                                                                                                    
        // return this.notificationsService.addQueueEmail({
        //     to: 'xarawe8861@endelite.com',
        //     subject: 'Test Email',
        //     html: 'Test Email'
        // })
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

        const parsedDate = moment(dateStr, ['DD MMM YYYY', 'DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MMM-YYYY']);
        return parsedDate.isValid() ? parsedDate : null;
    }

    async bulkImportCsv(filePath: string, userId: UuidParamDto): Promise<void> {
        const results: Contract[] = [];
        const batchSize = 10000;

        try {

            // find stepprogress sliug == selesai
            const stepProgress = await this.stepProgressService.findBySlug("selesai");
            this.logger.log(`Step Progress found: ${JSON.stringify(stepProgress)}`);

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


                        const contract = new Contract();
                        contract.title = sanitizedRow["NAMA PERJANJIAN"];
                        contract.contract_number = sanitizedRow["NOMOR PERJANJIAN"];

                        // Handle start_date dynamically (either English or Indonesian month)
                        const startDate = this.parseDate(sanitizedRow["BERAWAL"]);
                        !startDate ? contract.start_date = null : contract.start_date = startDate.toDate();

                        // Validate reminder_date
                        const reminderDate = this.parseDate(sanitizedRow["REMIND"]);
                        !reminderDate ? contract.reminder_date = null : contract.reminder_date = reminderDate.toDate();

                        // Validate end_date (exither English or Indonesian month)
                        const endDate = this.parseDate(sanitizedRow["BERAKHIR"]);
                        !endDate ? contract.end_date = null : contract.end_date = endDate.toDate();

                        contract.description = sanitizedRow["PERIHAL"];
                        contract.notes = sanitizedRow["KETERANGAN"];
                        contract.user = { id: userId.id } as User; // Set user from request
                        contract.step_progress = stepProgress; // Set step progress to "selesai"


                        // this.logger.log(`Parsed contract document: ${JSON.stringify(contract)}`);
                        results.push(contract);

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

            // this.logger.log(`CSV file processed successfully. Total records: ${results}`);
        } catch (error) {
            this.logger.error('Error importing CSV file', error);
            throw error;
        }
    }

    async saveBatch(results: Contract[]): Promise<void> {
        const queryBuilder = this.contractRepository.createQueryBuilder();

        // Prepare the values to be upserted
        const values = results.map(item => ({
            title: item.title,
            contract_number: item.contract_number,
            start_date: item.start_date,
            reminder_date: item.reminder_date,
            end_date: item.end_date,
            description: item.description,
            notes: item.notes,
            step_progress: item.step_progress,
            user: item.user,
        }));

        try {
            // Perform the bulk upsert using ON CONFLICT for PostgreSQL
            await queryBuilder
                .insert()
                .into(Contract)
                .values(values)
                .onConflict(`("contract_number") DO NOTHING`)
                .execute();

            // console.log(`Successfully saved batch of ${values.length} records.`);
        } catch (error) {
            console.log('Error during bulk upsert:', error);
            throw error;
        }
    }

    // @Cron('* * 8 * * *') // cron every at 08:00:00 AM
    // @Cron('*/30 * * * * *') // cron every at 08:00:00 AM
    async cronScheduleReminderContract() {
        try {
            // filter reminder date range today and tomorrow
            const today = moment().startOf('day').toDate();
            const tomorrow = moment().add(1, 'day').startOf('day').toDate();
            const contractsData = await this.contractRepository.find({
                where: {
                    reminder_date: Between(today, tomorrow),
                    deletedAt: null,
                },
                relations: ['user'],
            });

            // find all user when role is Department Legal
            const users: User[] = await this.userService.findAllByRoleName(["Department Legal"]);

            if (contractsData.length === 0) {
                this.logger.log('No contract data found with reminder date today or tomorrow.');
                return;
            } else {
                // Send reminder emails
                for (const contract of contractsData) {
                    for (const user of users) {
                        this.notificationsService.addQueueEmail({
                            to: user.email,
                            subject: `Reminder: Kontrak Segera Berakhir`,
                            templateName: 'reminder',
                            context: {
                                userName: user.name,
                                title: contract.title,
                                url: `http://localhost:3001/dashboard/perjanjian/${contract.id}`,
                                number: contract.contract_number,
                                type: 'Kontrak',
                                description: contract.description,
                                reminder_date: moment(contract.reminder_date).format('DD MMMM YYYY'),
                            },
                        });
                    }
                }
            }

        } catch (error) {
            this.logger.log('Error in cronScheduleReminderContract:', error);
            throw error;
        }
    }
}
