import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ResourcesRoleService } from './resources_role.service';
import { CreateResourcesRoleDto } from './dto/create-resources_role.dto';
import { UpdateResourcesRoleDto } from './dto/update-resources_role.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateResourceDto } from '../resources/dto/update-resource.dto';
import { ResourceRole } from 'src/common/entities/resource-role.entity';

@Controller('resources-role')
export class ResourcesRoleController {
  constructor(private readonly resourcesRoleService: ResourcesRoleService) {}

  @Post()
  create(@Body() createResourceDto: CreateResourcesRoleDto) {
    return this.resourcesRoleService.create(createResourceDto);
  } 

  @Post('page')
  findAll(@Body() { page, size, orderBy, sort, filters }: { page: number, size: number, orderBy: string, sort: 'asc' | 'desc', filters: Partial<ResourceRole> }) {
    return this.resourcesRoleService.findAll(page, size, orderBy, sort, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesRoleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourcesRoleDto): Promise<ResponseDto> {
    return this.resourcesRoleService.update(+id, updateResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.resourcesRoleService.remove(+id);
  }
}
