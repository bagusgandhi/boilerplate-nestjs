import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { UploadsService } from './uploads.service';
import _ from 'lodash';
import { CreateUploadsDto } from './dto/create-uploads.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomMulter } from 'src/utils/multer.options';
import { Public } from 'src/decorators/public.decorator';
import { UploadsFileDto } from './dto/uploads-file.dto';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({
    summary: 'Get file',
  })
  @Get(':id')
  async fileDetail(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const findFile = await this.uploadsService.findById(id);
    const file = createReadStream(join(findFile.path));

    const extension = _.last(findFile?.path?.split('.'));
    const fileName = !findFile?.originalName?.includes('.')
      ? `${findFile?.originalName}.${extension}`
      : findFile?.originalName;

    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    return new StreamableFile(file);
  }

  @ApiOperation({
    summary: 'Upload file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor(
      'file',
      null,
      CustomMulter(
        'uploads',
        'file',
        ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'],
        1000 * 1024,
      ),
    ),
  )
  @Post()
  async createUpload(
    @Body() body: UploadsFileDto,
    @GetUser() user: IUserRequest,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    const payload: CreateUploadsDto = {
      originalName: file[0].originalname,
      size: file[0].size,
      path: file[0].path,
    };

    console.log(file);
    console.log(payload);
    console.log(user);

    return await this.uploadsService.create(payload, user?.id as any);
  }
}
