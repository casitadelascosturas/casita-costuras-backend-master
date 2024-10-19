import { DetailServiceDto } from "./detail-service.dto";

export class CreateServiceDto {
    readonly name: string;
    readonly image?: string;
    readonly cost?: number;
    readonly cost_material?: number;
    readonly init_price: number;
    readonly end_price: number;
    readonly details: DetailServiceDto[];  // Lista de medidas asociadas al servicio
  }
  