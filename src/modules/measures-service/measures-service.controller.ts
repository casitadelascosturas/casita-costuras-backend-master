import { Controller } from '@nestjs/common';
import { MeasuresServiceService } from './measures-service.service';

@Controller('measures-service')
export class MeasuresServiceController {
  constructor(private readonly measuresServiceService: MeasuresServiceService) {}
}
