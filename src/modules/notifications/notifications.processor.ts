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
      rejectUnauthorized: false,
    },
  });

  async process(job: any) {
    const emailOptions: EmailOptions = job.data;

    try {
      // Dynamically load the HTML template based on the template name
      let htmlContent = await this.loadTemplate(emailOptions.templateName);

      // Handle dynamic templating (if context is provided)
      if (emailOptions.context) {
        const template = handlebars.compile(htmlContent);
        htmlContent = template(emailOptions.context); // Replace variables in the template
      }

      // Set up email options with potential attachments
      const mailOptions = {
        from: EMAIL_FROM || '"Your App" <your-email@gmail.com>',
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

    // Method to load template dynamically based on template name
  private async loadTemplate(templateName: string): Promise<string> {
    // Determine the path of the template
    const templatePath = path.join(__dirname, '..', '..', '..', 'email-templates', `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file ${templateName} not found at path ${templatePath}`);
    }

    // Read the template file content
    return fs.promises.readFile(templatePath, 'utf-8');
  }
}
