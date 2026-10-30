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
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ROLE } from 'src/users/enums/ROLE.enum';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // El formulario público del sitio entra aquí sin sesión (solo API key).
  @Public()
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  // Cualquier usuario autenticado puede consultar: el servicio recorta los
  // formularios a los de su departamento (admin y gerencia ven todos).
  @Get()
  findAll(@Query() pagination: PaginationDto, @GetUser() user?: JwtPayload) {
    return this.leadsService.findAll(pagination, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user?: JwtPayload,
  ) {
    return this.leadsService.findOne(id, user);
  }

  @Roles(ROLE.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.remove(id);
  }
}
