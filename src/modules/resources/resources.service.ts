import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from 'src/common/entities/resource.entity';
import { Like, Repository } from 'typeorm';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';

@Injectable()
export class ResourcesService {
    
    constructor(
        @InjectRepository(Resource)
        private resourcesRepository: Repository<Resource>,
      ) {}
    
      async create(createResourceDto: CreateResourceDto): Promise<ResponseDto> {

        try { 
          const existingResourcePath = await this.resourcesRepository.findOne({
            where: { path: createResourceDto.path },
          });
          const existingResourceName = await this.resourcesRepository.findOne({
            where: { label: createResourceDto.label },
          });

          if (existingResourcePath && existingResourceName) {
            return {
              code: HttpCode.BAD_REQUEST,
              message: 'Nombre y url duplicados'
            };
          } else if (existingResourcePath) {
            return {
              code: HttpCode.BAD_REQUEST,
              message: 'Url duplicada'
            };
          } else if(existingResourceName){
            return {
              code: HttpCode.BAD_REQUEST,
              message: 'Nombre duplicado'
            };
          }
  
          const resource = this.resourcesRepository.create(createResourceDto);
          const savedResource = await this.resourcesRepository.save(resource);
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
    
      async findAll(page: number = 1, size: number = 10, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Resource>): Promise<ResponsePageDto> {
        try {
          const queryBuilder = this.resourcesRepository.createQueryBuilder('resource')
            .skip((page) * size)
            .take(size);
    
          Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
              if (typeof value === 'string') {
                queryBuilder.andWhere(`resource.${key} LIKE :${key}`, { [key]: `%${value}%` });
              } else {
                queryBuilder.andWhere(`resource.${key} = :${key}`, { [key]: value });
              }
            }
          });
    
          queryBuilder.orderBy(orderBy ?`resource.${orderBy}`: 'resource.id', sort);
    
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
        const resource = await this.resourcesRepository.findOne({ where: { id } });
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

      async update(id: number, updateResourceDto: UpdateResourceDto): Promise<ResponseDto> {
        const existingResource = await this.resourcesRepository.findOne({ where: { id } });
        if (!existingResource) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el registro con ID ${id}`,
            data: null,
          };
        }
    
        try {
          await this.resourcesRepository.update(id, updateResourceDto);
          const updatedResource = await this.resourcesRepository.findOne({ where: { id } });
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
        const existingResource = await this.resourcesRepository.findOne({ where: { id } });
        if (!existingResource) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el registro con ID ${id}`,
            data: null,
          };
        }
    
        try {
          await this.resourcesRepository.remove(existingResource);
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
