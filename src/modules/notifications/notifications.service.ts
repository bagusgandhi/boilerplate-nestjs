import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  context?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    constructor(
        @InjectQueue('notifications')
        private notificationsQueue: Queue, // Replace 'any' with the actual type if available
    ) {}

    async addQueueEmail(...payload: EmailOptions[]){
        return Promise.all(
            payload.map((e) => {
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
