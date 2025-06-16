import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './notifications.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
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
