import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './notifications.processor';
import { Env } from 'src/config/env-loader';

const { REDIS_HOST, REDIS_PORT } = Env()

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'notifications'
    })
  ],
  controllers: [],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService]
})
export class NotificationsModule {}
