import { Module } from '@nestjs/common';
import { SewingServicesService } from './sewing-services.service';
import { SewingServicesController } from './sewing-services.controller';
import { Measure } from 'src/common/entities/measure.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/common/entities/service.entity';
import { MeasuresServiceEntity } from 'src/common/entities/measure-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measure, Service, MeasuresServiceEntity])],
  controllers: [SewingServicesController],
  providers: [SewingServicesService],
})
export class SewingServicesModule {}
