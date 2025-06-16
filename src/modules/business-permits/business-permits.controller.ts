import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessPermitsService } from './business-permits.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomMulter } from 'src/utils/multer.options';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { FilterBusinessPermitsDto } from './dto/filter-business-permits.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { UpsertBusinessPermitsDto } from './dto/upsert-business-permits.dto';
import { BulkInsertDto } from '../business-permits-approve/dto/bulk-insert.dto';

@ApiTags('Business Permits')
@Controller('business-permits')
export class BusinessPermitsController {
    constructor(private readonly businessPermitsService: BusinessPermitsService) {}

    @ApiOperation({
        summary: 'Get all business permits.',
    })
    @ApiBearerAuth()
    // @Permissions('business-permits.viewListOfBusinessPermits')
    @Get()
    async findAll(@Query() query: FilterBusinessPermitsDto) {
        return this.businessPermitsService.findAll(query);
    }

    @ApiOperation({
        summary: 'Get all approved business permits.',
    })
    @ApiBearerAuth()
    // @Permissions('contract.viewListOfContract')
    @Get("approved")
    async findAllApproved(@Query() query: FilterBusinessPermitsDto) {
        return this.businessPermitsService.findAllApproved(query);
    }

    @ApiOperation({
        summary: 'import csv file business permits.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('business-permits.uploadBusinessPermits')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('business-permits-import', 'uploads', ['text/csv'], 1000 * 1024),
        ),
    )
    @Post('import')
    async bulkImport(@Body() body: BulkInsertDto, @GetUser() user: IUserRequest, @UploadedFiles() file: Express.Multer.File[]) {
        return this.businessPermitsService.bulkImportCsv(file[0].path, user.id as any);
    }

    @ApiOperation({
        summary: 'Get all business permits by current user.',
    })
    @ApiBearerAuth()
    @Get('me')
    async findAllByCurrentUser(@Query() query: FilterBusinessPermitsDto, @GetUser() user: IUserRequest) {
        return this.businessPermitsService.findAllByCurrentUser(query, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get business permits by id by current user.',
    })
    @ApiBearerAuth()
    @Get('me/:id')
    async findByIdByCurrentUser(@Param() params: UuidParamDto, @GetUser() user: IUserRequest) {
        return this.businessPermitsService.findByIdByCurrentUser(params.id, user?.id as any);
    }

    // post uploads file by current user
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
        return this.businessPermitsService.uploadsByCurrentUser(params.id, uploadsData, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get business permits by id.',
    })
    @ApiBearerAuth()
    // @Permissions('business-permits.viewBusinessPermits')
    @Get(':id')
    async findById(@Param() params: UuidParamDto) {
        return this.businessPermitsService.findById(params.id);
    }

    @ApiOperation({
        summary: 'Create business permits.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('business-permits.createBusinessPermits')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('contract', 'file', ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'], 1000 * 1024),
        ),
    )
    @Post()
    async create(
        @Body() body: UpsertBusinessPermitsDto,
        @GetUser() user: IUserRequest,
        @UploadedFiles() file: Express.Multer.File[],
    ) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));

        return this.businessPermitsService.create(body, user?.id as any, uploadsData);
    }

    @ApiOperation({
        summary: 'Update contract.',
    })
    // @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param() params: UuidParamDto, @Body() body: UpsertBusinessPermitsDto) {
        return this.businessPermitsService.update(params.id, body);
    }

    @ApiOperation({
        summary: 'Delete business permits.',
    })
    @ApiBearerAuth()
    // @Permissions('business-permits.deleteBusinessPermits')
    @Delete(':id')
    async delete(@Param() params: UuidParamDto) {
        return this.businessPermitsService.delete(params.id);
    }

    @ApiOperation({
        summary: 'Uploads file business permits.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('business-permits.uploadBusinessPermits')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('contract', 'file', ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'], 1000 * 1024),
        ),
    )
    @Post(':id/uploads')
    async uploads(@Param() params: UuidParamDto, @GetUser() user: IUserRequest, @UploadedFiles() file: Express.Multer.File[]) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));
        return this.businessPermitsService.uploads(params.id, uploadsData, user?.id as any);
    }
}
