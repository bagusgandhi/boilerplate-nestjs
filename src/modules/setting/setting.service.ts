import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { DataSource, Repository } from 'typeorm';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../user/user.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as moment from 'moment';

@Injectable()
export class SettingService {
    private readonly logger = new Logger(SettingService.name);

    constructor(
        @InjectRepository(Setting)
        private settingRepository: Repository<Setting>,
        @InjectDataSource() private dataSource: DataSource,
        private readonly userService: UserService,
        private readonly notificationsService: NotificationsService
    ){}

    // find all setting data
    async findAll(): Promise<Setting[]> {
        try {
            return this.settingRepository.find()
        } catch(error){
            this.logger.error('Failed to find all setting data', error.stack);
            throw error;
        }
    }

    // upsert setting data
    async upsertData(body: UpsertSettingDto): Promise<Setting> {
        try {
            let settingData: Setting;

            if (body.id) {
                settingData = await this.settingRepository.findOne({ where: { id: body.id } });

                if (settingData) {
                    await this.settingRepository.update(body.id, body);
                }
            }

            if (!settingData) {
                settingData = await this.settingRepository.save(body);
            }

            return settingData;
        } catch (error) {
            this.logger.error('Failed to upsert setting', error.stack);
            throw error;
        }
    }


    // call stored_procedure function
    async callStoredProcedure(functionName: string, params: any[]): Promise<any> {
        try {
            const paramPlaceholders = params.map((_, index) => `$${index + 1}`).join(', ');
            const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;
            const result = await this.settingRepository.query(query, params);
            return result;
        } catch (error) {
            this.logger.error('Error calling stored procedure', error.stack);
            throw error;
        }
    }

    async findDataAndSendNotif(day: number, userIds: string[]) {
        try {
            await this.dataSource.query(`SET TIME ZONE 'Asia/Jakarta';`)
            const result = await this.callStoredProcedure('get_data_by_date_diff', [day])
            const usersData = await this.userService.findUserByIds(userIds);

            if (result?.length === 0 || usersData?.length === 0) return

            const typeMap = {
                'contract': "perjanjian",
                'business_permit': "perizinan",
                'corporate_document': "akta-rups"
            }

            result.forEach((item: { id: string, title: string, data_number: string, end_date: Date, type: string}) => {
                usersData.forEach((user: { id: string, name: string, email: string }) => {
                    this.notificationsService.addQueueEmail({
                        to: user.email,
                        subject: `Reminder: ${item?.type} Segera Berakhir`,
                        templateName: 'reminder',
                        context: {
                            userName: user.name,
                            title: item.title,
                            url: `http://localhost:3001/dashboard/${typeMap[item?.type]}/${item.id}`,
                            number: item.data_number,
                            type: typeMap[item?.type],
                            description: "",
                            reminder_date: moment(item.end_date).format('DD MMMM YYYY'),
                        },
                    });
                })
            })

        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    @Cron("0 0 9 * * *")
    async scheduleReminder(): Promise<void> {
        try {
            const dataSettings: Setting[] = await this.findAll();
            if(dataSettings?.length > 0) {
                const data = dataSettings[0];

                // map remind_date publish to bullmq
                data?.reminder_days_before?.forEach((day: number) => {
                    this.findDataAndSendNotif(day, data?.userIds);
                })

            } else {
                this.logger.log("Data Setting Not found!")
            }

        } catch(error){
            this.logger.error(error);
            throw error;
        }
    }
    
}
