import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateResourceDto {
  @IsOptional() // Opcional, ya que puede no ser necesario durante la creación
  @IsNumber()
  readonly id_resources_group?: number;

  @IsString()
  readonly icon: string;

  @IsString()
  readonly label: string;

  @IsString()
  readonly path: string;

  // Puedes definir otros campos adicionales que consideres necesarios
}
