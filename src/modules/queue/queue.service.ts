import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DeploymentPayload } from 'src/types/deployment-payload';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  constructor(@InjectQueue('deploy') private deployerQueue: Queue) {}

  async addQueueDeploy(payload: DeploymentPayload) {
    try {
      const job = await this.deployerQueue.add('deploy', payload);
      return job;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
