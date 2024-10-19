import { IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class CreateProductOrderDto {
  @IsInt()
  idProduct: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price_final: number;
}
