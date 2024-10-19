import { Module } from '@nestjs/common';
import { MeasuresServiceService } from './measures-service.service';
import { MeasuresServiceController } from './measures-service.controller';

@Module({
  controllers: [MeasuresServiceController],
  providers: [MeasuresServiceService],
})
export class MeasuresServiceModule {}
