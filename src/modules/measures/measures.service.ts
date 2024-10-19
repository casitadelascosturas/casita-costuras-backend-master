import { Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Measure } from 'src/common/entities/measure.entity';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { UpdateMeasureDto } from './dto/update-measure.dto';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { FilesEntity } from 'src/common/entities/files.entity';
import { FirebaseService } from 'src/common/services/firebase.service';
import { FoldersFirebase } from 'src/common/enums/folders-firebase.enum';
import { MeasuresServiceEntity } from 'src/common/entities/measure-service.entity';
import { UNIT_MEASURES } from 'src/common/constant/options-unit-measure';

@Injectable()
export class MeasuresService {
  options: any[] = UNIT_MEASURES;

    constructor(
        @InjectRepository(Measure)
        @InjectRepository(Measure) private measuresRepository: Repository<Measure>,
        @InjectRepository(FilesEntity)
        private fileRepository: Repository<FilesEntity>,
        @InjectRepository(MeasuresServiceEntity)
        private readonly measuresServiceRepository: Repository<MeasuresServiceEntity>,
        private firebaseService: FirebaseService) 
        {}

    async all(): Promise<ResponseDto> {
        try {
          const measures = await this.measuresRepository.createQueryBuilder('measure')
            .leftJoinAndSelect('measure.image', 'image')  // Cargar la relación con la imagen
            .select([
                'measure.id',       // Seleccionar solo el campo id de measure
                'measure.name',     // Seleccionar solo el campo name de measure
                'measure.description' // Seleccionar solo el campo description de measure
            ])
            .addSelect('image.url')  // Seleccionar solo el campo url de la imagen
            .orderBy('measure.name', 'ASC')  // Ordenar por el campo name
            .getMany();

            const response = measures.map(measure => ({
              id: measure.id,
              name: measure.name,
              description: measure.description,
              image: measure.image?.url || null // Solo devolver la URL de la imagen
            }));
    
            return {
              code: HttpCode.OK,
              message: HttpMessage.OK,
              data: response
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

    async create(createMeasureDto: CreateMeasureDto, image?: Express.Multer.File): Promise<ResponseDto> {
      try {
        
          const { name, description, measure_value  } = createMeasureDto;
          const existingMeasureByName = await this.measuresRepository.findOne({ where: { name } });
                    
          if(existingMeasureByName){
              return {
                  code: HttpCode.BAD_REQUEST,
                  message: `El Detalle con el nombre: ${name}, ya fue registrado.`
                };
          }

          let fileEntity = null;
          
          if (image) {
            const folder = FoldersFirebase.MEASURES;
            const { fileName, publicUrl } = await this.firebaseService.uploadFile(image, folder);
      
            if(!publicUrl){
              return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: `Error al cargar imagen!`
              };
            }

            fileEntity = this.fileRepository.create({
              name: fileName,
              path: `${folder}/${fileName}`,
              url: publicUrl
            });

            if(!fileEntity){
              return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: `Error al guardar imagen!`
              };
            }

            fileEntity = await this.fileRepository.save(fileEntity);
          }

          const measureEntity = this.measuresRepository.create({
            name,
            description,
            image: fileEntity,
            measure_value: measure_value
          });
          const savedMeasure = await this.measuresRepository.save(measureEntity);
          return {
              code: HttpCode.CREATED,
              message: HttpMessage.CREATED,
              data: {
                id: savedMeasure.id,
                name: savedMeasure.name,
                description: savedMeasure.description,
                image: savedMeasure.image,
                measure_value: measure_value
              }
          };

      } catch(error){
          return {
              code: HttpCode.SERVICE_UNAVAILABLE,
              message: HttpMessage.SERVICE_UNAVAILABLE,
              data: null
          }
      }
    }

    async page(page: number, size: number, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Measure>): Promise<ResponsePageDto> {
      try {            
        const queryBuilder = this.measuresRepository.createQueryBuilder('measure')
        .leftJoinAndSelect('measure.image', 'image')
        .select([
          'measure.id',
          'measure.name',
          'measure.description',
          'measure.measure_value',
          'image.url',
        ])
        .skip(page * size)
        .take(size);
  
        Object.keys(filters).forEach((key) => {
          const value = filters[key];
          if (value !== null && value !== undefined && value !== '' && value !== 'image') {
            if (typeof value === 'string') {
              queryBuilder.andWhere(`measure.${key} LIKE :${key}`, { [key]: `%${value}%` });
            } else {
              queryBuilder.andWhere(`measure.${key} = :${key}`, { [key]: value });
            }
          }
        });
  
        const validOrderBys = ['id', 'name', 'description'];
        if (!validOrderBys.includes(orderBy)) {
          orderBy = 'measure.id';
        } else {
          orderBy = `measure.${orderBy}`;
        }
        queryBuilder.orderBy(orderBy, sort);
  
        // Ejecutamos la consulta y obtenemos los resultados
        const [result, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / size);
  
        const responseData = result.map((measure) => ({
          id: measure.id,
          name: measure.name,
          description: measure.description,
          measure_value: this.getLabelByValue(measure.measure_value),
          image: measure.image ? measure.image.url : null, // Devolver la URL de la imagen si existe
        }));

        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: {
            content: responseData,
            total: total,
            totalPages: totalPages, // Total de páginas
            currentPage: page, // Página actual
            pageSize: size // Tamaño de la página
          }
        };
      } catch (error) {
        console.error('Error en el método page:', error);
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
        const measure = await this.measuresRepository.createQueryBuilder('measure')
        .leftJoinAndSelect('measure.image', 'image')
        .select([
          'measure.id',
          'measure.name',
          'measure.measure_value',
          'measure.description',
          'image.url'
        ])
        .where('measure.id = :id', { id })
        .getOne();

      if (!measure) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el detalle con ID ${id}`,
          data: null,
        };
      }
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: {
          id: measure.id,
          name: measure.name,
          measure_value: measure.measure_value,
          description: measure.description,
          image: measure.image ? measure.image.url : null
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

    async update(id: number, updateMeasureDto: UpdateMeasureDto, image?: Express.Multer.File): Promise<ResponseDto> {

      const { name } = updateMeasureDto;

      const [existingMeasure, existingMeasureName] = await Promise.all([
        this.measuresRepository.findOne({
          where: { id },
          relations: ['image'],
        }),
        this.measuresRepository.findOne({
          where: { name },
          relations: ['image'],
        }),
      ]);

      if (!existingMeasure) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el producto con ID ${id}`,
          data: null,
        };
      }

      if (existingMeasureName && Number(existingMeasureName.id) !== Number(id)) {
        return {
          code: HttpCode.BAD_REQUEST,
          message: `El detalle con nombre ${name} ya fue registrado!`,
          data: null,
        };
      }
    
      const updatedFields: Partial<Measure> = {};
    
      try {
        // Actualizar nombre y descripción si se proporcionan
        if (updateMeasureDto.name !== undefined && updateMeasureDto.name !== null) {
          updatedFields.name = updateMeasureDto.name;
        }

        if (updateMeasureDto.measure_value !== undefined && updateMeasureDto.measure_value !== null) {
          updatedFields.measure_value = updateMeasureDto.measure_value;
        }

        if (updateMeasureDto.description !== undefined && updateMeasureDto.description !== null) {
          updatedFields.description = updateMeasureDto.description;
        }
    
        // Manejo de la nueva imagen
        if (image) {
          // Eliminar la imagen anterior de Firebase y de la base de datos
          if (existingMeasure.image) {
            try {
              // Primero, desasociar la imagen de la entidad Measure
              await this.measuresRepository.update(id, { image: null });
    
              // Luego, eliminar la imagen en Firebase
              await this.firebaseService.deleteFile(existingMeasure.image.path);
            } catch (error) {
              // Capturar el error si no se encuentra el archivo en Firebase y continuar
              if (error.code === 404) {
                console.log('Archivo no encontrado en Firebase, continuando con el flujo.');
              } else {
                console.error('Error al eliminar archivo de Firebase:', error);
              }
            }
    
            // Eliminar el registro del archivo en la base de datos
            await this.fileRepository.delete(existingMeasure.image.id);
          }
    
          // Subir la nueva imagen a Firebase
          const folder = FoldersFirebase.MEASURES;
          const { fileName, publicUrl } = await this.firebaseService.uploadFile(image, folder);
    
          if (!publicUrl) {
            return {
              code: HttpCode.SERVICE_UNAVAILABLE,
              message: 'Error al cargar la nueva imagen!',
            };
          }
    
          // Crear el nuevo registro de archivo en la base de datos
          const fileEntity = this.fileRepository.create({
            name: fileName,
            path: `${folder}/${fileName}`,
            url: publicUrl,
          });
          const savedFile = await this.fileRepository.save(fileEntity);
          updatedFields.image = savedFile;  // Asignar la nueva imagen
        }
    
        if (Object.keys(updatedFields).length === 0) {
          return {
            code: HttpCode.BAD_REQUEST,
            message: 'No se proporcionó ninguna propiedad para actualizar.',
            data: null,
          };
        }
    
        // Actualizar el registro en la base de datos
        await this.measuresRepository.update(id, updatedFields);
        const updatedMeasure = await this.measuresRepository.findOne({
          where: { id },
          relations: ['image'],  // Incluir nuevamente la imagen
        });
    
        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: {
            id: updatedMeasure.id,
            name: updatedMeasure.name,
            description: updatedMeasure.description,
            measure_value: updatedMeasure.measure_value,
            image: updatedMeasure.image ? updatedMeasure.image.url : null,
          },
        };
      } catch (error) {
        console.error('Error al actualizar el registro:', error);
        return {
          code: HttpCode.SERVICE_UNAVAILABLE,
          message: HttpMessage.SERVICE_UNAVAILABLE,
          data: null,
        };
      }
    }  

    async remove(id: number): Promise<ResponseDto> {
      const existingMeasure = await this.measuresRepository.findOne({
        where: { id },
        relations: ['image'],
      });
      if (!existingMeasure) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el detalle con ID ${id}`,
          data: null,
        };
      }
      const relatedMeasuresService = await this.measuresServiceRepository.findOne({
        where: { measure: { id } },
      });

      if (relatedMeasuresService) {
        return {
          code: HttpCode.CONTINUE,
          message: 'El detalle no se puede eliminar, está relacionada con servicios.',
          data: null,
        };
      }
  
      try {
        if (existingMeasure.image) {
          try {
            await this.measuresRepository.update(id, { image: null });
  
            await this.firebaseService.deleteFile(existingMeasure.image.path);
          } catch (error) {
            if (error.code === 404) {
              console.log('Archivo no encontrado en Firebase, continuando...');
            } else {
              console.error('Error al eliminar el archivo de Firebase:', error);
            }
          }
  
          await this.fileRepository.delete(existingMeasure.image.id);
        }
        await this.measuresRepository.remove(existingMeasure);
  
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

    getLabelByValue(value: string): string | undefined {
      const measure = this.options.find(item => item.value === value);
      return measure ? measure.label : undefined;
    }
  
}
