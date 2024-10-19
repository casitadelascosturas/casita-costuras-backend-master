import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  payment_employee: string;

  @IsOptional()
  @IsNumber()
  id_user_create: number;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROCESS', 'FINALIZED', 'LATE'])
  status: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE';

  @IsOptional()
  @IsDateString()
  init_day?: string;

  @IsOptional()
  @IsDateString()
  create_day?: string;


  @IsOptional()
  @IsDateString()
  end_day?: string;
}
