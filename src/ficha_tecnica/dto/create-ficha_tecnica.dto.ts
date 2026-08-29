import {
  IsBoolean,
  IsDateString,
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

/**
 * El único dato obligatorio de una ficha técnica es el nombre del cliente.
 * Todo lo demás es opcional; los campos que llegan vacíos se ignoran.
 */
export class CreateFichaTecnicaDto {
  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  nombreCliente: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  telefonoCliente?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  direccionCliente?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  correoCliente?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  servicio?: string;

  @IsOptional()
  @IsEnum(TIPO_EQUIPO)
  tipoEquipo?: TIPO_EQUIPO;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  nombreResponsable?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  marcaEquipo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  modeloEquipo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  referencia?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  tiempoGarantiaMeses?: number;

  @IsOptional()
  @IsDateString()
  fechaAdquisicion?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  tipoMonitor?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  serialEquipo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  tamanoPantallaPulgadas?: number;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  procesadorMarca?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  procesadorModelo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10)
  procesadorBits?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(512)
  nucleosCpu?: number;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  velocidadProcesador?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4096)
  memoriaRamGb?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  cantidadDiscosDuros?: number;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  tecnologiaDisco1?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(102400)
  capacidadDisco1Gb?: number;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  tecnologiaDisco2?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(102400)
  capacidadDisco2Gb?: number;

  @IsOptional()
  @IsBoolean()
  lectorDvdCd?: boolean;

  @IsOptional()
  @IsBoolean()
  tarjetaVideoIntegrada?: boolean;

  @IsOptional()
  @IsBoolean()
  tarjetaVideoIndependiente?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(16)
  conectoresVga?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(16)
  puertosHdmi?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(32)
  puertosUsb?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(16)
  puertosPci?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(16)
  puertosPciExpress?: number;

  @IsOptional()
  @IsBoolean()
  tarjetaEthernet?: boolean;

  @IsOptional()
  @IsBoolean()
  tarjetaRedInalambrica?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  marcaMouse?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  serialMouse?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  tipoConectorMouse?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fechaRealizacion?: string;
}
