import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { StepProgressService } from './step-progress.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { UpsertStepProgressDto } from './dto/upsert-step-progress.dto';

@ApiTags('Step Progress')
@Controller('step-progress')
export class StepProgressController {
    constructor(private readonly stepProgressService: StepProgressService) {}

    @ApiOperation({
        summary: 'Get all step progress.',
    })
    @ApiBearerAuth()
    // @Permissions('stepProgress.viewListOfStepProgress')
    @Get()
    async findAll(@Query() query: PaginationDto) {
        return this.stepProgressService.findAll(query);
    }

    @ApiOperation({
        summary: 'Get step progress by id.',
    })
    @ApiBearerAuth()
    // @Permissions('stepProgress.viewStepProgress')
    @Get(':id')
    async findById(@Param() params: UuidParamDto) {
        return this.stepProgressService.findById(params.id);
    }

    @ApiOperation({
        summary: 'Create step progress.',
    })
    @ApiBearerAuth()
    // @Permissions('stepProgress.createStepProgress')
    @Post()
    async create(@Body() stepProgressDto: UpsertStepProgressDto) {
        return this.stepProgressService.create(stepProgressDto);
    }

    @ApiOperation({
        summary: 'Update step progress.',
    })
    @ApiBearerAuth()
    @Permissions('stepProgress.updateStepProgress')
    @Put(':id')
    async update(@Param() params: UuidParamDto, @Body() stepProgressDto: UpsertStepProgressDto) {
        return this.stepProgressService.update(params.id, stepProgressDto);
    }

    @ApiOperation({
        summary: 'Delete step progress.',
    })
    @ApiBearerAuth()
    // @Permissions('stepProgress.deleteStepProgress')
    @Delete(':id')
    async delete(@Param() params: UuidParamDto) {
        return this.stepProgressService.delete(params.id);
    }
}
