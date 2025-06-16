import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars'; // Handlebars template engine
import { Env } from 'src/config/env-loader';

const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_PORT } = Env(); // Load environment variables

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

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  private transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD, // Securely handle your credentials
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
  

  async process(job: any) {
    const emailOptions: EmailOptions = job.data;

    try {
      // Handle dynamic templating (if context is provided)
      let htmlContent = emailOptions.html;
      if (emailOptions.context) {
        const template = handlebars.compile(htmlContent);
        htmlContent = template(emailOptions.context); // Replace variables in the template
      }

      // Set up email options with potential attachments
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Your App" <your-email@gmail.com>',
        to: emailOptions.to, // list of receivers
        subject: emailOptions.subject, // Subject line
        html: htmlContent, // HTML content body
        attachments: emailOptions.attachments, // Attachments if provided
      };

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.response}`);
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error; // Will retry based on queue configuration
    }
  }
}
