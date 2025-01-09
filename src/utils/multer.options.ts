import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Request } from 'express';
import * as mime from 'mime';

/**
 * path : /module/id/type/filename.ext
 */
export const CustomMulter = (
  module = 'default',
  type = 'default',
  fileType?: string[],
  fileSize?: number | { maxSize: number; fileType: string | string[] }[],
): MulterOptions => ({
  storage: diskStorage({
    destination: (req: Request, file, cb) => {
      const uploadPath = path.join(
        '.',
        process.env.UPLOAD_PATH ?? 'uploads',
        module,
        type,
      );

      if (!fs.existsSync(uploadPath))
        fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${crypto
        .randomBytes(16)
        .toString('hex')}.${mime.getExtension(file.mimetype)}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      fileType &&
      fileType.every((e) => mime.getExtension(file.mimetype).includes(e))
    ) {
      cb(new BadRequestException('restricted extension'), false);
      return;
    }

    if (typeof fileSize === 'number' && file.size > fileSize)
      cb(new BadRequestException('file size too large'), false);
    else if (
      typeof fileSize === 'object' &&
      fileSize.find(({ fileType }) =>
        fileType.includes(mime.getExtension(file.mimetype)),
      )?.maxSize < file.size
    )
      cb(new BadRequestException('files size too large'), false);

    cb(null, true);
  },
});
