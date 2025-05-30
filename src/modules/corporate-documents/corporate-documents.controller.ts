import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CorporateDocumentsService } from './corporate-documents.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomMulter } from 'src/utils/multer.options';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { FilterCorporateDocumentsDto } from './dto/filter-corporate-documents.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { UpsertCorporateDocumentsDto } from './dto/upsert-corporate-documents.dto';

@ApiTags('Corporate Documents')
@Controller('corporate-documents')
export class CorporateDocumentsController {
    constructor(private readonly corporateDocumentsService: CorporateDocumentsService) {}

    @ApiOperation({
        summary: 'Get all corporate documents.',
    })
    @ApiBearerAuth()
    // @Permissions('corporate-documents.viewListOfCorporateDocuments')
    @Get()
    async findAll(@Query() query: FilterCorporateDocumentsDto) {
        return this.corporateDocumentsService.findAll(query);
    }

    @ApiOperation({
        summary: 'Get all corporate documents by current user.',
    })
    @ApiBearerAuth()
    @Get('me')
    async findAllByCurrentUser(@Query() query: FilterCorporateDocumentsDto, @GetUser() user: IUserRequest) {
        return this.corporateDocumentsService.findAllByCurrentUser(query, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get corporate document by id by current user.',
    })
    @ApiBearerAuth()
    @Get('me/:id')
    async findByIdByCurrentUser(@Param() params: UuidParamDto, @GetUser() user: IUserRequest) {
        return this.corporateDocumentsService.findByIdByCurrentUser(params.id, user?.id as any);
    }

    @ApiOperation({
        summary: 'Uploads file by current user.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @Post('me/:id/uploads')
    async uploadsByCurrentUser(@Param() params: UuidParamDto, @GetUser() user: IUserRequest, @UploadedFiles() file: Express.Multer.File[]) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));
        return this.corporateDocumentsService.uploadsByCurrentUser(params.id, uploadsData, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get corporate document by id.',
    })
    @ApiBearerAuth()
    // @Permissions('corporate-documents.viewCorporateDocument')
    @Get(':id')
    async findById(@Param() params: UuidParamDto) {
        return this.corporateDocumentsService.findById(params.id);
    }

    @ApiOperation({
        summary: 'Create corporate document.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('corporate-documents.createCorporateDocument')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('corporate-documents', 'file', ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'], 1000 * 1024),
        ),
    )
    @Post()
    async create(
        @Body() body: UpsertCorporateDocumentsDto,
        @GetUser() user: IUserRequest,
        @UploadedFiles() file: Express.Multer.File[],
    ) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));

        return this.corporateDocumentsService.create(body, user?.id as any, uploadsData);
    }

    @ApiOperation({
        summary: 'Update corporate document.',
    })
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param() params: UuidParamDto, @Body() body: UpsertCorporateDocumentsDto) {
        return this.corporateDocumentsService.update(params.id, body);
    }

    @ApiOperation({
        summary: 'Delete corporate document.',
    })
    @ApiBearerAuth()
    // @Permissions('corporate-documents.deleteCorporateDocument')
    @Delete(':id')
    async delete(@Param() params: UuidParamDto) {
        return this.corporateDocumentsService.delete(params.id);
    }

    @ApiOperation({
        summary: 'Uploads file for corporate document.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('corporate-documents.uploadCorporateDocument')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('corporate-documents', 'file', ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'], 1000 * 1024),
        ),
    )
    @Post(':id/uploads')
    async uploads(@Param() params: UuidParamDto, @GetUser() user: IUserRequest, @UploadedFiles() file: Express.Multer.File[]) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));
        return this.corporateDocumentsService.uploads(params.id, uploadsData, user?.id as any);
    }
}
