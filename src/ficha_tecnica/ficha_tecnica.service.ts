import { Injectable } from '@nestjs/common';
import { CreateFichaTecnicaDto } from './dto/create-ficha_tecnica.dto';
import { UpdateFichaTecnicaDto } from './dto/update-ficha_tecnica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FichaTecnica } from './entities/ficha_tecnica.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FichaTecnicaService {
  constructor(
    @InjectRepository(FichaTecnica)
    private readonly fichaTecnicaRepo: Repository<FichaTecnica>,
  ) { }
  async getAllFichasTenicas() {
    return this.fichaTecnicaRepo.find();
  }
}
