import { Module } from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { MeasuresController } from './measures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measure } from 'src/common/entities/measure.entity';
import { FilesEntity } from 'src/common/entities/files.entity';
import { FirebaseService } from 'src/common/services/firebase.service';
import { MeasuresServiceEntity } from 'src/common/entities/measure-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Measure, FilesEntity, MeasuresServiceEntity])
  ],
  controllers: [MeasuresController],
  providers: [MeasuresService, FirebaseService],
  exports: [MeasuresService]
})
export class MeasuresModule {}
