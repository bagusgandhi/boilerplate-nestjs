import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars'; // Handlebars template engine
import * as fs from 'fs'; // File system module
import * as path from 'path'; // Path module
import { Env } from 'src/config/env-loader';

const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_FROM } = Env(); // Load environment variables

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

@Processor('notifications')
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  private transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    // secure: true,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
    logger: true,
    debug:true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  async process(job: { name: string, data: any}): Promise<void> {
    console.log(job)

    try {
      const jobMap = {
        'email': this.processEmail(job.data as EmailOptions),
        'reminder': ""
      };

      jobMap[job.name]

    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  async processEmail(emailOptions: EmailOptions): Promise<void> {
    try {
      let htmlContent = await this.loadTemplate(emailOptions.templateName);
      if (emailOptions.context) {
        const template = handlebars.compile(htmlContent);
        htmlContent = template(emailOptions.context);
      }

      const mailOptions = {
        from: EMAIL_FROM || 'Naiweb Support <support@naiweb.id>',
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: htmlContent,
        attachments: emailOptions.attachments,
        cc: emailOptions.cc,
        bcc: emailOptions.bcc,
      };

      await this.transporter.sendMail(mailOptions);

    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(__dirname, '..', '..', '..', 'email-templates', `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file ${templateName} not found at path ${templatePath}`);
    }

    return fs.promises.readFile(templatePath, 'utf-8');
  }
}
