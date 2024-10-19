import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource } from 'src/common/entities/resource.entity';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) {}

    @Post()
    create(@Body() createResourceDto: CreateResourceDto) {
      return this.resourcesService.create(createResourceDto);
    } 
  
    @Post('page')
    findAll(@Body() { page, size, orderBy, sort, filters }: { page: number, size: number, orderBy: string, sort: 'asc' | 'desc', filters: Partial<Resource> }) {
      return this.resourcesService.findAll(page, size, orderBy, (sort === 'asc') ? 'ASC' : 'DESC', filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.resourcesService.findOne(+id);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto): Promise<ResponseDto> {
      return this.resourcesService.update(+id, updateResourceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<ResponseDto> {
      return this.resourcesService.remove(+id);
    }
}
