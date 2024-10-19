import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  payment?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROCESS', 'FINALIZED', 'LATE'])
  status?: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE';

  @IsOptional()
  @IsDateString()
  init_day?: string;

  @IsOptional()
  @IsDateString()
  end_day?: string;

  @IsOptional()
  @IsDateString()
  userId?: number;
}
