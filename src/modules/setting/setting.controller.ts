import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { Permissions } from 'src/decorators/permission.decorator';

@ApiTags('Setting')
@Controller('setting')
export class SettingController {
    constructor(
        private readonly settingService: SettingService
    ){}

    @ApiOperation({
        summary: 'Get all setting.',
    })
    @ApiBearerAuth()
    @Permissions('setting.viewListOfSetting')
    @Get()
    async findAllSetting() {
        return this.settingService.findAll();
    }

    @ApiOperation({
        summary: 'Upsert Setting Data.',
    })
    @ApiBearerAuth()
    @Permissions('setting.upsertData')
    @Post()
    async upsertSetting(@Body() body: UpsertSettingDto) {
        return this.settingService.upsertData(body);
    }

}
