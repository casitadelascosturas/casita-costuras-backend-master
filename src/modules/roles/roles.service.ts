import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/entities/role.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { RolePermission } from 'src/common/entities/permission.entity';
import { Resource } from 'src/common/entities/resource.entity';
import { ResourcesGroup } from 'src/common/entities/resources_group.entity';
import { ResourceRole } from 'src/common/entities/resource-role.entity';
import { GroupPage, Item } from './interfaces/data-role';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    // private roleRepository: Repository<Role>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Resource) private resourceRepository: Repository<Resource>,
    @InjectRepository(ResourcesGroup) private resourcesGroupRepository: Repository<ResourcesGroup>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(ResourceRole) private resourceRoleRepository: Repository<ResourceRole>
  ) {}

  async create(createResourceDto: CreateRoleDto): Promise<ResponseDto> {

    try { 
      const existingResourceName = await this.roleRepository.findOne({
        where: { name: createResourceDto.name },
      });

      if(existingResourceName){
        return {
          code: HttpCode.BAD_REQUEST,
          message: 'Nombre duplicado'
        };
      }

      const role = this.roleRepository.create(createResourceDto);
      const savedResource = await this.roleRepository.save(role);
      return {
        code: HttpCode.CREATED,
        message: HttpMessage.CREATED,
        data: savedResource,
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async all(): Promise<ResponseDto> {
    try {
      const roles = await this.roleRepository.find({
        order: { name: 'ASC' }
      });

      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: roles,
      };
    } catch (error) {
      console.error(error);
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async findAll(page: number = 1, size: number = 10, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Role>): Promise<ResponsePageDto> {
    try {
      const queryBuilder = this.roleRepository.createQueryBuilder('role')
        .skip((page) * size)
        .take(size);

      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string') {
            queryBuilder.andWhere(`role.${key} LIKE :${key}`, { [key]: `%${value}%` });
          } else {
            queryBuilder.andWhere(`role.${key} = :${key}`, { [key]: value });
          }
        }
      });

      queryBuilder.orderBy(orderBy ?`role.${orderBy}`: 'role.id', sort);
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
          totalPages: totalPages,
        },
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: {
          content: [],
          total: null,
          currentPage: null,
          pageSize: null,
          totalPages: 0,
        },
      };
    }
  }

  async findOne(id: number): Promise<ResponseDto> {
    const resource = await this.roleRepository.findOne({ where: { id } });
    if (!resource) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el registro con ID ${id}`,
        data: null
      };
    }

    return {
      code: HttpCode.OK,
      message: HttpMessage.OK,
      data: resource,
    };
  }
  
  async update(id: number, updateResourceDto: UpdateRoleDto): Promise<ResponseDto> {
    const existingResource = await this.roleRepository.findOne({ where: { id } });
    if (!existingResource) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el registro con ID ${id}`,
        data: null,
      };
    }

    try {
      await this.roleRepository.update(id, updateResourceDto);
      const updatedResource = await this.roleRepository.findOne({ where: { id } });
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: updatedResource,
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
    const existingResource = await this.roleRepository.findOne({ where: { id } });
    if (!existingResource) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el registro con ID ${id}`,
        data: null,
      };
    }

    try {
      await this.roleRepository.remove(existingResource);
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

  async getRoleData(idRole: number, idUser: number): Promise<ResponseDto> {
    try {
      const role = await this.roleRepository.findOne({ where: { id: idRole } });
      if (!role) {
        return { code: 404, message: `No se encontró el rol con ID ${idRole}`, data: null };
      }
  
      const resourceRoles = await this.resourceRoleRepository
        .createQueryBuilder('resourcesRole')
        .innerJoinAndSelect('resourcesRole.resourcesGroup', 'resourcesGroup')
        .leftJoinAndSelect('resourcesGroup.resources', 'resources')
        .leftJoinAndSelect('resources.rolePermissions', 'rolePermissions', 'rolePermissions.id_role = :idRole', { idRole })
        .where('resourcesRole.id_role = :idRole', { idRole })
        .getMany();
  
      const resourceGroups: GroupPage[] = resourceRoles.map((resourceRole) => {
        const { id, label, name, separator } = resourceRole.resourcesGroup;
        
        const items = this.getResourceItems(resourceRole.resourcesGroup.resources, idRole);
  
        return {
          id,
          group: name,
          label,
          separator,
          items,
        };
      });
  
      const response = {
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
        },
        pages: resourceGroups
      };
  
      return { code: 200, message: 'Operación exitosa', data: response };
  
    } catch (error) {
      console.error('Error en getRoleData:', error);
      return { code: 500, message: 'Error interno del servidor', data: null };
    }
  }
  
  getResourceItems(resources: Resource[], idRole: number): Item[] {
    return resources.map((resource) => {

      const permission = resource.rolePermissions?.[0];
      const resourcePermissions = permission
        ? {
            create: permission.canCreate,
            delete: permission.canDelete,
            update: permission.canUpdate,
            read: permission.canRead,
          }
        : {
            create: false,
            delete: false,
            update: false,
            read: false,
          };
  
      return {
        icon: resource.icon,
        label: resource.label,
        route: resource.path,
        footer: resource.footer,
        permissions: resourcePermissions,
      };
    });
  }
  
}
