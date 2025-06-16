import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { ContractService } from './contract.service';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { UpsertContractDto } from './dto/upsert-contract.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomMulter } from 'src/utils/multer.options';
import { CreateUploadsDto } from '../uploads/dto/create-uploads.dto';
import { FilterContractDto } from './dto/filter-contract.dto';
import { AddApprovalDto } from './dto/add-approval.dto';
import { ProcessDto } from './dto/process.dto';
import { BulkInsertDto } from 'src/global/dto/bulk-insert.dto';

@ApiTags('Contract')
@Controller('contract')
export class ContractController {
    constructor(private readonly contractService: ContractService) {}

    @ApiOperation({
        summary: 'Get all contracts.',
    })
    @ApiBearerAuth()
    // @Permissions('contract.viewListOfContract')
    @Get()
    async findAll(@Query() query: FilterContractDto) {
        return this.contractService.findAll(query);
    }

    @ApiOperation({
        summary: 'Get all approved contracts.',
    })
    @ApiBearerAuth()
    // @Permissions('contract.viewListOfContract')
    @Get("approved")
    async findAllApproved(@Query() query: FilterContractDto) {
        return this.contractService.findAllApproved(query);
    }

    @ApiOperation({
        summary: 'import csv file contract.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('contract.importCsv')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('constract-approve-import', 'uploads', ['text/csv'], 1000 * 1024),
        ),
    )
    @Post('import')
    async import(@Body() body: BulkInsertDto, @GetUser() user: IUserRequest, @UploadedFiles() file: Express.Multer.File[]) {
        return this.contractService.bulkImportCsv(file[0].path, user.id as any);
    }

    @ApiOperation({
        summary: 'Get all contracts by current user.',
    })
    @ApiBearerAuth()
    @Get('me')
    async findAllByCurrentUser(@Query() query: FilterContractDto, @GetUser() user: IUserRequest) {
        return this.contractService.findAllByCurrentUser(query, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get contract by id by current user.',
    })
    @ApiBearerAuth()
    @Get('me/:id')
    async findByIdByCurrentUser(@Param() params: UuidParamDto, @GetUser() user: IUserRequest) {
        return this.contractService.findByIdByCurrentUser(params.id, user?.id as any);
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
        return this.contractService.uploadsByCurrentUser(params.id, uploadsData, user?.id as any);
    }

    @ApiOperation({
        summary: 'Get contract by id.',
    })
    @ApiBearerAuth()
    // @Permissions('contract.viewContract')
    @Get(':id')
    async findById(@Param() params: UuidParamDto) {
        return this.contractService.findById(params.id);
    }

    @ApiOperation({
        summary: 'Create contract.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('contract.createContract')
    @UseInterceptors(
        FilesInterceptor(
            'file',
            null,
            CustomMulter('contract', 'file', ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'xls', 'csv', 'doc'], 1000 * 1024),
        ),
    )
    @Post()
    async create(
        @Body() body: UpsertContractDto,
        @GetUser() user: IUserRequest,
        @UploadedFiles() file: Express.Multer.File[],
    ) {
        const uploadsData: CreateUploadsDto[] = file.map((file) => ({
            originalName: file.originalname,
            size: file.size,
            path: file.path,
        }));

        return this.contractService.create(body, user?.id as any, uploadsData);
    }

    @ApiOperation({
        summary: 'Update contract.',
    })
    // @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param() params: UuidParamDto, @Body() body: UpsertContractDto) {
        return this.contractService.update(params.id, body);
    }

    @ApiOperation({
        summary: 'Update contract process.',
    })
    // @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @Put(':id/process')
    async updateProcess(@Param() params: UuidParamDto, @Body() body: ProcessDto) {
        return this.contractService.processContract(params.id, body);
    }

    @ApiOperation({
        summary: 'Delete contract.',
    })
    @ApiBearerAuth()
    // @Permissions('contract.deleteContract')
    @Delete(':id')
    async delete(@Param() params: UuidParamDto) {
        return this.contractService.delete(params.id);
    }

    @ApiOperation({
        summary: 'Uploads file contract.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    // @Permissions('contract.uploadContract')
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
        return this.contractService.uploads(params.id, uploadsData, user?.id as any);
    }


    @ApiOperation({
        summary: 'Assign Approval user to contract.',
    })
    @ApiBearerAuth()
    @Post(':id/approval')
    async assignApproval(
        @Param() params: UuidParamDto, 
        @Body() body: AddApprovalDto
    ) {
        return this.contractService.assignApprovalToContract(params.id, body)
    }

    @ApiOperation({
        summary: 'Get Approver user to contract.',
    })
    @ApiBearerAuth()
    @Get(':id/approval')
    async getApprovalByIdContract(@Param() params: UuidParamDto) {
        return this.contractService.getApprovalByIdContract(params.id)
    }

    // create test queue email send to all user email
    @ApiOperation({
        summary: 'Create test queue email send to all user email.',
    })
    @ApiBearerAuth()
    @Post('test-queue-email')
    async testQueueEmail() {
        return this.contractService.testQueueEmail()
    }

    // delete uploads file contract
    // @ApiOperation({
    //     summary: 'Delete uploads file contract.',
    // })
    // @ApiBearerAuth()
    // @Delete(':id/uploads/:uploadId')
    // async deleteUploads(@Param() params: UuidParamDto) {
    //     return this.contractService.deleteUploads(params.id, params.uploadId);
    // }
}