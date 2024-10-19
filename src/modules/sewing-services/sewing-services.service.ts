import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Service } from 'src/common/entities/service.entity';
import { Measure } from 'src/common/entities/measure.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { MeasuresServiceEntity } from 'src/common/entities/measure-service.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';

@Injectable()
export class SewingServicesService {

    constructor(
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
    
        @InjectRepository(Measure)
        private measureRepository: Repository<Measure>,
    
        @InjectRepository(MeasuresServiceEntity)
        private measuresServiceRepository: Repository<MeasuresServiceEntity>
    ) {}

    async create(createServiceDto: CreateServiceDto): Promise<ResponseDto> {
        try {
            const { name, image, init_price, end_price, details, cost, cost_material } = createServiceDto;
    
             const existingServiceByName = await this.serviceRepository.findOne({ where: { name } });
                    
          if(existingServiceByName){
              return {
                  code: HttpCode.BAD_REQUEST,
                  message: `El Servicio ${name}, ya fue registrado.`
                };
          }

            const newService = this.serviceRepository.create({
                name,
                image,
                init_price,
                end_price,
                cost,
                cost_material
            });
    
            const savedService = await this.serviceRepository.save(newService);
    
            if (details && details.length > 0) {
                for (const detail of details) {
                    const measure = await this.measureRepository.findOne({ where: { id: detail.id } });
                    if (!measure) {
                        return {
                            code: HttpCode.NOT_FOUND,
                            message: `No se encontró la medida con ID ${detail.id}`,
                            data: null
                        };
                    }
    
                    const newMeasureService = this.measuresServiceRepository.create({
                        service: savedService,
                        measure,
                      });
    
                    await this.measuresServiceRepository.save(newMeasureService);
                }
            }
    
            return {
                code: HttpCode.CREATED,
                message: HttpMessage.CREATED,
                data: savedService
            };
    
        } catch (error) {
            console.error('Error al crear el servicio:', error);
            return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: 'Error al crear el servicio',
                data: null
            };
        }
    }
    
    async page(
        page: number, 
        size: number, 
        orderBy: string, 
        sort: 'ASC' | 'DESC', 
        filters: Partial<Service>
      ): Promise<ResponsePageDto> {
        try {
          const queryBuilder = this.serviceRepository.createQueryBuilder('service')
        //     .leftJoinAndSelect('service.image', 'image') 
            .select([
              'service.id',
              'service.name',
              'service.cost_material',
              'service.cost',
              'service.init_price',
              'service.end_price',
            //   'image.url'
            ])
            .skip(page * size)
            .take(size);
      
          // Aplicar filtros
          Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
              if (typeof value === 'string') {
                queryBuilder.andWhere(`service.${key} LIKE :${key}`, { [key]: `%${value}%` });
              } else {
                queryBuilder.andWhere(`service.${key} = :${key}`, { [key]: value });
              }
            }
          });
      
          // Validar campos de ordenamiento
          const validOrderBys = ['id', 'name', 'cost', 'cost_material', 'init_price', 'end_price'];
          if (!validOrderBys.includes(orderBy)) {
            orderBy = 'service.id'; // Orden por defecto
          } else {
            orderBy = `service.${orderBy}`;
          }
      
          queryBuilder.orderBy(orderBy, sort);
      
          // Obtener los resultados paginados
          const [result, total] = await queryBuilder.getManyAndCount();
          const totalPages = Math.ceil(total / size);
      
          // Formatear los resultados para la respuesta
          const responseData = result.map((service) => ({
            id: service.id,
            name: service.name,
            cost: service.cost,
            cost_material: service.cost_material,
            init_price: service.init_price,
            end_price: service.end_price
          }));
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              content: responseData,
              total: total,
              totalPages: totalPages,
              currentPage: page,
              pageSize: size,
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
        try {
          const service = await this.serviceRepository.findOne({ where: { id } });
          
          if (!service) {
            return {
              code: HttpCode.NOT_FOUND,
              message: `No existe el servicio con ID ${id}`,
              data: null,
            };
          }
      
          const details = await this.measuresServiceRepository.find({
            where: { service: { id } },
            relations: ['measure', 'measure.image'],
          }).then(measures => measures.map(({ measure }) => ({
            id: measure.id,
            name: measure.name,
            measure_value: measure.measure_value,
            description: measure.description,
            image: measure.image?.url || null,
          })));
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              id: service.id,
              name: service.name,
              cost: service.cost,
              cost_material: service.cost_material,
              init_price: service.init_price,
              end_price: service.end_price,
              details,
            },
          };
      
        } catch (error) {
          return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
          };
        }
    }

    async update(id: number, updateServiceDto: Partial<CreateServiceDto>): Promise<ResponseDto> {
        try {
          const service = await this.serviceRepository.findOne({ where: { id } });
          if (!service) {
            return {
              code: HttpCode.NOT_FOUND,
              message: `No existe el servicio con ID ${id}`,
              data: null,
            };
          }
      
          Object.assign(service, updateServiceDto);
          await this.serviceRepository.save(service);
      
          if (updateServiceDto.details) {
            const newMeasureIds = updateServiceDto.details.map(detail => detail.id);
      
            await this.measuresServiceRepository.delete({
              service: { id },
              measure: { id: Not(In(newMeasureIds)) },
            });
      
            const existingMeasures = await this.measuresServiceRepository.find({
              where: { service: { id } },
              relations: ['measure'],
            });
            const existingMeasureIds = existingMeasures.map(detail => detail.measure.id);
      
            const measuresToAdd = newMeasureIds.filter(id => !existingMeasureIds.includes(id));
            if (measuresToAdd.length > 0) {
              const newDetails = await this.measureRepository.findByIds(measuresToAdd);
              const newMeasureServices = newDetails.map(measure => this.measuresServiceRepository.create({
                service,
                measure,
              }));
              await this.measuresServiceRepository.save(newMeasureServices);
            }
          }
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: service,
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
        try {
          // Paso 1: Consultar el servicio por su ID
          const service = await this.serviceRepository.findOne({ where: { id } });
          if (!service) {
            return {
              code: HttpCode.NOT_FOUND,
              message: `No existe el servicio con ID ${id}`,
              data: null,
            };
          }
      
          // Paso 2: Eliminar las relaciones en la tabla intermedia measures_service
          await this.measuresServiceRepository.delete({ service: { id } });
      
          // Paso 3: Eliminar el servicio después de eliminar las relaciones
          await this.serviceRepository.remove(service);
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: null,
          };
      
        } catch (error) {
          console.error('Error al eliminar el servicio:', error);
          return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
          };
        }
    }
      

}
