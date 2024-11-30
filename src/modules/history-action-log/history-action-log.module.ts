import { Module } from '@nestjs/common';
import { HistoryActionLogService } from './history-action-log.service';
import { HistoryActionLogController } from './history-action-log.controller';

@Module({
  providers: [HistoryActionLogService],
  controllers: [HistoryActionLogController]
})
export class HistoryActionLogModule {}
