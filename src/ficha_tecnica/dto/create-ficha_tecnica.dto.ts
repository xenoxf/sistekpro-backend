import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { TIPO_EQUIPO } from '../enums/TIPO_EQUIPO.enum';

export class CreateFichaTecnicaDto {
  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  nombreCliente: string;

  @IsString()
  @Length(6, 30)
  @IsNotEmpty()
  telefonoCliente: string;

  @IsString()
  @Length(5, 150)
  @IsNotEmpty()
  direccionCliente: string;

  @IsEmail()
  @IsNotEmpty()
  correoCliente: string;

  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  servicio: string;

  @IsEnum(TIPO_EQUIPO)
  @IsNotEmpty()
  tipoEquipo: TIPO_EQUIPO;

  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  nombreResponsable: string;

  @IsString()
  @Length(2, 50)
  @IsNotEmpty()
  marcaEquipo: string;

  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  modeloEquipo: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  referencia?: string;

  @IsInt()
  @Min(0)
  @Max(240)
  @IsOptional()
  tiempoGarantiaMeses?: number;

  @IsDateString()
  @IsOptional()
  fechaAdquisicion?: string;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  tipoMonitor?: string;

  @IsString()
  @Length(4, 60)
  @IsNotEmpty()
  serialEquipo: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  tamanoPantallaPulgadas?: number;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  procesadorMarca?: string;

  @IsString()
  @Length(2, 80)
  @IsOptional()
  procesadorModelo?: string;

  @IsString()
  @Length(2, 10)
  @IsOptional()
  procesadorBits?: string;

  @IsInt()
  @Min(1)
  @Max(512)
  @IsOptional()
  nucleosCpu?: number;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  velocidadProcesador?: string;

  @IsInt()
  @Min(1)
  @Max(4096)
  @IsOptional()
  memoriaRamGb?: number;

  @IsInt()
  @Min(1)
  @Max(8)
  @IsOptional()
  cantidadDiscosDuros?: number;

  @IsString()
  @Length(2, 30)
  @IsOptional()
  tecnologiaDisco1?: string;

  @IsInt()
  @Min(1)
  @Max(102400)
  @IsOptional()
  capacidadDisco1Gb?: number;

  @IsString()
  @Length(2, 30)
  @IsOptional()
  tecnologiaDisco2?: string;

  @IsInt()
  @Min(1)
  @Max(102400)
  @IsOptional()
  capacidadDisco2Gb?: number;

  @IsBoolean()
  @IsOptional()
  lectorDvdCd?: boolean;

  @IsBoolean()
  @IsOptional()
  tarjetaVideoIntegrada?: boolean;

  @IsBoolean()
  @IsOptional()
  tarjetaVideoIndependiente?: boolean;

  @IsInt()
  @Min(0)
  @Max(16)
  @IsOptional()
  conectoresVga?: number;

  @IsInt()
  @Min(0)
  @Max(16)
  @IsOptional()
  puertosHdmi?: number;

  @IsInt()
  @Min(0)
  @Max(32)
  @IsOptional()
  puertosUsb?: number;

  @IsInt()
  @Min(0)
  @Max(16)
  @IsOptional()
  puertosPci?: number;

  @IsInt()
  @Min(0)
  @Max(16)
  @IsOptional()
  puertosPciExpress?: number;

  @IsBoolean()
  @IsOptional()
  tarjetaEthernet?: boolean;

  @IsBoolean()
  @IsOptional()
  tarjetaRedInalambrica?: boolean;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  marcaMouse?: string;

  @IsString()
  @Length(2, 60)
  @IsOptional()
  serialMouse?: string;

  @IsString()
  @Length(2, 30)
  @IsOptional()
  tipoConectorMouse?: string;

  @IsString()
  @Length(0, 2000)
  @IsOptional()
  observaciones?: string;

  @IsDateString()
  @IsOptional()
  fechaRealizacion?: string;
}
