import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createResourceDto: CreateRoleDto) {
    return this.rolesService.create(createResourceDto);
  } 

  @Get('all')
  all() {
    return this.rolesService.all();
  }

  @Post('page')
  findAll(@Body() { page, size, orderBy, sort, filters }: { page: number, size: number, orderBy: string, sort: 'asc' | 'desc', filters: Partial<Role> }) {
    return this.rolesService.findAll(page, size, orderBy, (sort === 'asc') ? 'ASC' : 'DESC', filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateRoleDto): Promise<ResponseDto> {
    return this.rolesService.update(+id, updateResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.rolesService.remove(+id);
  }

  @Post('permissions/user')
  async getRoleData(
    @Body('idRole') idRole: number,
    @Request() req: any // Puedes definir mejor el tipo si tienes una interfaz
  ): Promise<ResponseDto> {
    const idUser = req.user.id; // Asumiendo que el guard de JWT agrega el usuario al request
    return this.rolesService.getRoleData(idRole, idUser);
  }
}
