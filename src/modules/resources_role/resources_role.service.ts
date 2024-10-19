import { Injectable } from '@nestjs/common';
import { CreateResourcesRoleDto } from './dto/create-resources_role.dto';
import { UpdateResourcesRoleDto } from './dto/update-resources_role.dto';
import { ResourceRole } from 'src/common/entities/resource-role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { Role } from 'src/common/entities/role.entity';
import { Resource } from 'src/common/entities/resource.entity';
import { ResourcesGroup } from 'src/common/entities/resources_group.entity';

@Injectable()
export class ResourcesRoleService {
  constructor(
    @InjectRepository(ResourceRole)
    private resourceRoleRepository: Repository<ResourceRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(ResourcesGroup)
    private resourcesGroupRepository: Repository<ResourcesGroup>,
  ) {}

  async create(createResourceRoleDto: CreateResourcesRoleDto): Promise<ResponseDto> {
    try {
      const { roleId, resourcesGroupId } = createResourceRoleDto;

      if(roleId && resourcesGroupId){
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el rol con ID ${roleId}`,
            data: null,
          };
        }
  
        const resourcesGroup = await this.resourceRepository.findOne({ where: { id: resourcesGroupId } });
        if (!resourcesGroup) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el recurso con ID ${resourcesGroupId}`,
            data: null,
          };
        }
  
        const resourceRole = this.resourceRoleRepository.create({ role, resourcesGroup });
        const savedResourceRole = await this.resourceRoleRepository.save(resourceRole);
        return {
          code: HttpCode.CREATED,
          message: HttpMessage.CREATED,
          data: savedResourceRole,
        };
      }else{
        return {
          code: HttpCode.BAD_REQUEST,
          message: `Datos incompletos`,
          data: null,
        };
      }

    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async findAll(page: number = 1, size: number = 10, orderBy: string = 'id', sort: 'asc' | 'desc', filters: any): Promise<ResponsePageDto> {
    try {
      
      const queryBuilder = this.resourceRoleRepository.createQueryBuilder('resourceRole')
        .leftJoinAndSelect('resourceRole.role', 'role')
        .leftJoinAndSelect('resourceRole.resource', 'resource')
        .skip((page) * size)
        .take(size);

      if (filters.id !== undefined && filters.id !== null) {
        queryBuilder.andWhere('resourceRole.id = :id', { id: filters.id });
      }

      if (filters.allowed) {
        queryBuilder.andWhere('resourceRole.allowed LIKE :allowed', { allowed: `%${filters.allowed}%` });
      }

      if (filters.role && filters.role.id !== undefined && filters.role.id !== null) {
        queryBuilder.andWhere('role.id = :roleId', { roleId: filters.role.id });
      }

      if (filters.resource && filters.resource.id !== undefined && filters.resource.id !== null) {
        queryBuilder.andWhere('resource.id = :resourceId', { resourceId: filters.resource.id });
      }

      queryBuilder.orderBy(orderBy ?`resourceRole.${orderBy}` : 'resourceRole.id', (sort=== 'asc')? 'ASC' : 'DESC');
      const [result, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / size);

      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: {
          content: result,
          total: total,
          currentPage: page,
          pageSize: size,
          totalPages: totalPages
        },
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: {
          content: [],
          total: null,
          currentPage: null,
          pageSize: null,
          totalPages: 0
        },
      };
    }
  }

  
  async findOne(id: number): Promise<ResponseDto> {
    try {
      const resourceRole = await this.resourceRoleRepository.findOne({ where: { id }, relations: ['role', 'resource'] });
      if (!resourceRole) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el registro con ID ${id}`,
          data: null,
        };
      }
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: resourceRole,
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async update(id: number, updateResourceRoleDto: UpdateResourcesRoleDto): Promise<ResponseDto> {
    try {
      const { roleId, resourcesGroupId } = updateResourceRoleDto;
  
      // Buscar el registro existente
      const existingResourceRole = await this.resourceRoleRepository.findOne({ where: { id } });
      if (!existingResourceRole) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el registro con ID ${id}`,
          data: null,
        };
      }
  
      // Verificar y obtener el rol si se proporciona un nuevo roleId
      if (roleId) {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el rol con ID ${roleId}`,
            data: null,
          };
        }
        existingResourceRole.role = role; // Actualizar el rol
      }
  
      // Verificar y obtener el grupo de recursos si se proporciona un nuevo resourcesGroupId
      if (resourcesGroupId) {
        const resourcesGroup = await this.resourcesGroupRepository.findOne({ where: { id: resourcesGroupId } });
        if (!resourcesGroup) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el grupo de recursos con ID ${resourcesGroupId}`,
            data: null,
          };
        }
        existingResourceRole.resourcesGroup = resourcesGroup; // Actualizar el grupo de recursos
      }
  
      // Guardar los cambios en la base de datos
      const updatedResourceRole = await this.resourceRoleRepository.save(existingResourceRole);
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: updatedResourceRole,
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }
  

  async remove(id: number): Promise<ResponseDto> {
    const existingResourceRole = await this.resourceRoleRepository.findOne({ where: { id } });
    if (!existingResourceRole) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el registro con ID ${id}`,
        data: null,
      };
    }

    try {
      await this.resourceRoleRepository.remove(existingResourceRole);
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: null,
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }
}
