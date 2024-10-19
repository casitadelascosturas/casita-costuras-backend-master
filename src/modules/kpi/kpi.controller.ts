import { Controller } from '@nestjs/common';
import { KpiService } from './kpi.service';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}
}
