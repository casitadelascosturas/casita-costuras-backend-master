import { IsOptional, IsDateString, IsNumber, IsInt, IsString, IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  notify?: number;

  @IsOptional()
  @IsDateString()
  deliver_date?: string;

  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @IsOptional()
  @IsDateString()
  actual_deliver_date?: string;

  @IsOptional()
  @IsNumber()
  advance_payment?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROCESS', 'FINALIZED', 'LATE', 'PENDING_DELIVERY', 'CANCEL'])
  status: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE' | 'PENDING_DELIVERY' | 'CANCEL';
  
}
