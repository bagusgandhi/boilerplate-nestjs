import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueProcessor } from './queue.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'deploy',
      },
      {
        name: 'notifications',
      }
    ),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
