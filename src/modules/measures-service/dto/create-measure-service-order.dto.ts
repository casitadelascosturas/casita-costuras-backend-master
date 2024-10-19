import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMeasureServiceOrderDto {
  @IsNotEmpty()
  @IsString()
  name_measures: string;

  @IsNotEmpty()
  @IsString()
  value_measures: string;
}
