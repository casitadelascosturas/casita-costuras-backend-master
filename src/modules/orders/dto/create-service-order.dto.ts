import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    ValidateNested,
    IsArray,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { CreateTaskDto } from 'src/modules/tasks/dto/create-task.dto';
  import { CreateMeasureServiceOrderDto } from 'src/modules/measures-service/dto/create-measure-service-order.dto';
  
  export class CreateServiceOrderDto {
    @IsNotEmpty()
    @IsNumber()
    idService: number;
  
    @IsNotEmpty()
    @IsNumber()
    price_final: number;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateTaskDto)
    task?: CreateTaskDto;
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMeasureServiceOrderDto)
    measuresServiceOrders?: CreateMeasureServiceOrderDto[];
  }
  