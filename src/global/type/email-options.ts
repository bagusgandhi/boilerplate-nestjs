export type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  context?: {
    [variable: string]: any;
  };
  attachments?: {
    filename: string;
    cid: string;
  }[];
  noTemplate?: boolean;
};