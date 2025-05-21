import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { StepGroupService } from './step-group.service';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { UpsertStepGroupDto } from './dto/upsert-step-group.dto';

@ApiTags('Step Group')
@Controller('step-group')
export class StepGroupController {
    constructor(private readonly stepGroupService: StepGroupService) {}

    @ApiOperation({
        summary: 'Get all step group.',
    })
    @ApiBearerAuth()
    // @Permissions('stepGroup.viewListOfStepGroup')
    @Get()
    async findAll(@Query() query: PaginationDto) {
        return this.stepGroupService.findAll(query);
    }

    @ApiOperation({
        summary: 'Get step group by id.',
    })
    @ApiBearerAuth()
    // @Permissions('stepGroup.viewStepGroup')
    @Get(':id')
    async findById(@Param() params: UuidParamDto) {
        return this.stepGroupService.findById(params.id);
    }

    @ApiOperation({
        summary: 'Create step group.',
    })
    @ApiBearerAuth()
    // @Permissions('stepGroup.createStepGroup')
    @Post()
    async create(@Body() stepGroupDto: UpsertStepGroupDto) {
        return this.stepGroupService.create(stepGroupDto);
    }

    @ApiOperation({
        summary: 'Update step group.',
    })
    @ApiBearerAuth()
    @Permissions('stepGroup.updateStepGroup')
    @Put(':id')
    async update(@Param() params: UuidParamDto, @Body() stepGroupDto: UpsertStepGroupDto) { 
        return this.stepGroupService.update(params.id, stepGroupDto);
    }

    @ApiOperation({
        summary: 'Delete step group.',
    })
    @ApiBearerAuth()
    @Permissions('stepGroup.deleteStepGroup')
    @Delete(':id')
    async delete(@Param() params: UuidParamDto) {
        return this.stepGroupService.delete(params.id);
    }
}
