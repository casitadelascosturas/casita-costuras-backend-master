import {
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
    IsEnum,
    IsInt,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { CreateProductOrderDto } from './create-product-order.dto';
import { CreateServiceOrderDto } from './create-service-order.dto';
  
  export class CreateOrderDto {
    @IsOptional()
    @IsString()
    telephone: string;
  
    @IsNotEmpty()
    @IsNumber()
    total: number;
  
    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    advance_payment: number;
    
    @IsOptional()
    @IsNumber()
    notify: number;
  
    @IsNotEmpty()
    @IsDateString()
    creation_date: string;
  
    @IsNotEmpty()
    @IsDateString()
    deliver_date: string;
  
    @IsOptional()
    @IsEnum(['PENDING', 'IN_PROCESS', 'FINALIZED', 'LATE', 'PENDING_DELIVERY', 'CANCEL'])
    status: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE' | 'PENDING_DELIVERY' | 'CANCEL';
    
  
    @IsNotEmpty()
    @IsInt()
    idUser: number;
  
    @IsOptional()
    @IsInt()
    idClient: number;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateClientDto)
    client?: CreateClientDto;
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductOrderDto)
    productOrders?: CreateProductOrderDto[];
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateServiceOrderDto)
    serviceOrders?: CreateServiceOrderDto[];
  }
  