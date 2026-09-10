import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE } from 'src/users/enums/ROLE.enum';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Roles(ROLE.admin, ROLE.marketing)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.leadsService.findAll(pagination);
  }

  @Roles(ROLE.admin, ROLE.marketing)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.findOne(id);
  }

  @Roles(ROLE.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.remove(id);
  }
}
