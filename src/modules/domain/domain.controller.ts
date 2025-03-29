import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DomainService } from './domain.service';
import { Domain } from './entities/domain.entity';
import { CreateDomainDto } from './dto/create-domain.dto';
import { Permissions } from 'src/decorators/permission.decorator';
import { from, map, Observable } from 'rxjs';
import { RegistrarService } from '../registrar/registrar.service';
import { Public } from 'src/decorators/public.decorator';
@ApiTags('Domain')
@Controller('domain')
export class DomainController {
  constructor(
    private readonly domainService: DomainService,
    private readonly registrarService: RegistrarService,
  ) {}

  @Sse('availability')
  @Public()
  checkAvailability(
    @Query('name') domainName: string,
    @Query('tlds') tlds?: string,
  ): Observable<MessageEvent> {
    const extensions = tlds?.split(',') || [
      '.com',
      '.net',
      '.id',
      '.co.id',
      '.org',
    ];
    return from(extensions).pipe(
      map((tld: string) => {
        const fullDomain = `${domainName}${tld}`;
        const result =
          this.registrarService.checkDomainAvailability(fullDomain);
        return {
          data: {
            domain: fullDomain,
            data: result,
            tld,
          },
        } as MessageEvent;
      }),
    );
  }

  @ApiOperation({
    summary: 'Search a domain.',
  })
  @Public()
  @Get('search')
  async searchDomain(@Query('domain') domain: string) {
    return this.registrarService.searchDomain(domain);
  }

  @ApiOperation({
    summary: 'Get all domains price.',
  })
  @Public()
  @Get()
  async findAll(): Promise<Domain[]> {
    return this.domainService.findAll();
  }

  @ApiOperation({
    summary: 'Get a domain by id.',
  })
  @ApiBearerAuth()
  @Permissions('domainManagement.viewDomain')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Domain> {
    return this.domainService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create a domain.',
  })
  @ApiBearerAuth()
  @Permissions('domainManagement.createDomain')
  @Post()
  async create(@Body() body: CreateDomainDto): Promise<Domain> {
    return this.domainService.create(body);
  }

  @ApiOperation({
    summary: 'Update a domain.',
  })
  @ApiBearerAuth()
  @Permissions('domainManagement.updateDomain')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreateDomainDto,
  ): Promise<Domain> {
    return this.domainService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a domain.',
  })
  @ApiBearerAuth()
  @Permissions('domainManagement.deleteDomain')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.domainService.delete(id);
  }
}
