import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DeploymentPayload } from 'src/types/deployment-payload';

interface EmailOptions {
  to: string;
  subject: string;
  templateName: string; // Specify the template to be used
  context: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
  cc?: string;
  bcc?: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  constructor(
    @InjectQueue('deploy') private deployerQueue: Queue,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async addQueueDeploy(payload: DeploymentPayload) {
    try {
      const job = await this.deployerQueue.add('deploy', payload);
      return job;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async addQueueEmail(...payload: EmailOptions[]) {
    return Promise.all(
      payload.map((e: EmailOptions) => {
        return this.notificationsQueue.add('email', e, {
          attempts: 3, // Retry up to 3 times on failure
          backoff: {
            type: 'exponential', // Exponential backoff for retries
            delay: 1000, // Initial delay of 1 second
          },
          removeOnComplete: true, // Remove job from queue when completed
        }).catch((error) => {
          this.logger.error('Failed to add email to queue', error);
        });
      })
    );
  }
}
