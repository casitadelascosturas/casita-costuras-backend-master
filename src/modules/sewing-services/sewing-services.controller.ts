import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { SewingServicesService } from './sewing-services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { Service } from 'src/common/entities/service.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('sewing-services')
export class SewingServicesController {
  constructor(private readonly sewingServicesService: SewingServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.sewingServicesService.create(createServiceDto);
  }

  @Post('page')
  findAll(
    @Body() { page, size, orderBy, sort, filters }: 
    { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<Service> }): Promise<ResponsePageDto> {
    return this.sewingServicesService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
  }

  @Get(':id')
    findOne(@Param('id') id: number): Promise<ResponseDto> {
      return this.sewingServicesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateUserDto: UpdateServiceDto): Promise<ResponseDto> {
      return this.sewingServicesService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<ResponseDto> {
      return this.sewingServicesService.remove(id);
    }
}
