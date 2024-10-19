import { Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { FilesEntity } from 'src/common/entities/files.entity';
import { FirebaseService } from 'src/common/services/firebase.service';
import { Product } from 'src/common/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FoldersFirebase } from 'src/common/enums/folders-firebase.enum';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        @InjectRepository(Product) private productsRepository: Repository<Product>,
        @InjectRepository(FilesEntity)
        private fileRepository: Repository<FilesEntity>, 
        private firebaseService: FirebaseService) {}

    async all(): Promise<ResponseDto> {
        try {
            const measures = await this.productsRepository.find({
              order: { name: 'ASC' }
            });
            return {
              code: HttpCode.OK,
              message: HttpMessage.OK,
              data: measures
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

    async create(createProductDto: CreateProductDto, image?: Express.Multer.File): Promise<ResponseDto> {
        try {
          
            const { name, status, description, price_sale_max, price_sale_min  } = createProductDto;
            const existingProductByName = await this.productsRepository.findOne({ where: { name } });
                      
            if(existingProductByName){
                return {
                    code: HttpCode.BAD_REQUEST,
                    message: `El Producto con el nombre: ${name}, ya fue registrado.`
                  };
            }
  
            let fileEntity = null;
            
            if (image) {
              const folder = FoldersFirebase.PRODUCTS;
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
                url: publicUrl,
              });
  
              if(!fileEntity){
                return {
                  code: HttpCode.SERVICE_UNAVAILABLE,
                  message: `Error al guardar imagen!`
                };
              }
  
              fileEntity = await this.fileRepository.save(fileEntity);
            }
  
            const measureEntity = this.productsRepository.create({
                name,
                status, 
                description, 
                image: fileEntity,
                price_sale_min: price_sale_min,
                price_sale_max: price_sale_max,
            });
            const savedMeasure = await this.productsRepository.save(measureEntity);
            return {
                code: HttpCode.CREATED,
                message: HttpMessage.CREATED,
                data: {
                  id: savedMeasure.id,
                  name: savedMeasure.name,
                  description: savedMeasure.description,
                  price_sale_min: savedMeasure.price_sale_min,
                  price_sale_max: savedMeasure.price_sale_max,
                  image: savedMeasure.image,
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

    async page(page: number, size: number, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Product>): Promise<ResponsePageDto> {
        try {            
          const queryBuilder = this.productsRepository.createQueryBuilder('product')
          .leftJoinAndSelect('product.image', 'image')
          .select([
            'product.id',
            'product.name',
            'product.price_sale_max',
            'product.price_sale_min',
            'product.status',
            'image.url',
          ])
          .skip(page * size)
          .take(size);
    
          Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '' && value !== 'image') {
              if (typeof value === 'string') {
                queryBuilder.andWhere(`product.${key} LIKE :${key}`, { [key]: `%${value}%` });
              } else {
                queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: value });
              }
            }
          });
    
          const validOrderBys = ['id', 'name', 'description', 'status'];
          if (!validOrderBys.includes(orderBy)) {
            orderBy = 'product.id';
          } else {
            orderBy = `product.${orderBy}`;
          }
          queryBuilder.orderBy(orderBy, sort);
    
          const [result, total] = await queryBuilder.getManyAndCount();
          const totalPages = Math.ceil(total / size);
    
          const responseData = result.map((product) => ({
            id: product.id,
            name: product.name,
            price_sale_max: Number(product.price_sale_max),
            price_sale_min: Number(product.price_sale_min),
            status: product.status,
            image: product.image ? product.image.url : null,
          }));
  
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              content: responseData,
              total: total,
              totalPages: totalPages,
              currentPage: page,
              pageSize: size
            }
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
          const product = await this.productsRepository.createQueryBuilder('product')
          .leftJoinAndSelect('product.image', 'image')
          .select([
            'product.id',
            'product.name',
            'product.description',
            'product.price_sale_max',
            'product.price_sale_min',
            'product.status',
            'image.url'
          ])
          .where('product.id = :id', { id })
          .getOne();
  
        if (!product) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el producto con ID ${id}`,
            data: null,
          };
        }
        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            price_sale_max: product.price_sale_max,
            price_sale_min: product.price_sale_min,
            status: product.status,
            image: product.image ? product.image.url : null
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

    async update(id: number, updateProductDto: UpdateProductDto, image?: Express.Multer.File): Promise<ResponseDto> {
        const { name } = updateProductDto;

        const [existingProduct, existingProductName] = await Promise.all([
        this.productsRepository.findOne({
            where: { id },
            relations: ['image'],
        }),
        this.productsRepository.findOne({
            where: { name },
            relations: ['image'],
        }),
        ]);

        if (!existingProduct) {
        return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el producto con ID ${id}`,
            data: null,
        };
        }

        if (existingProductName && Number(existingProductName.id) !== Number(id)) {
        return {
            code: HttpCode.BAD_REQUEST,
            message: `El producto con nombre ${name} ya fue registrado!`,
            data: null,
        };
        }
      
        const updatedFields: Partial<Product> = {};
      
        try {
          if (updateProductDto.name !== undefined && updateProductDto.name !== null) {
            updatedFields.name = updateProductDto.name;
          }
      
          if (updateProductDto.description !== undefined && updateProductDto.description !== null) {
            updatedFields.description = updateProductDto.description;
          }

          if (updateProductDto.price_sale_max !== undefined && updateProductDto.price_sale_max !== null) {
            updatedFields.price_sale_max = updateProductDto.price_sale_max;
          }

          if (updateProductDto.price_sale_min !== undefined && updateProductDto.price_sale_min !== null) {
            updatedFields.price_sale_min = updateProductDto.price_sale_min;
          }

          if (updateProductDto.status !== undefined && updateProductDto.status !== null) {
            updatedFields.status = updateProductDto.status;
          }
      
          if (image) {
            if (existingProduct.image) {
              try {
                await this.productsRepository.update(id, { image: null });
                await this.firebaseService.deleteFile(existingProduct.image.path);
              } catch (error) {
                if (error.code === 404) {
                  console.log('Archivo no encontrado en Firebase, continuando con el flujo.');
                } else {
                  console.error('Error al eliminar archivo de Firebase:', error);
                }
              }
              await this.fileRepository.delete(existingProduct.image.id);
            }
      
            const folder = FoldersFirebase.PRODUCTS;
            const { fileName, publicUrl } = await this.firebaseService.uploadFile(image, folder);
      
            if (!publicUrl) {
              return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: 'Error al cargar la nueva imagen!',
              };
            }
            const fileEntity = this.fileRepository.create({
              name: fileName,
              path: `${folder}/${fileName}`,
              url: publicUrl,
            });
            const savedFile = await this.fileRepository.save(fileEntity);
            updatedFields.image = savedFile; 
          }
      
          if (Object.keys(updatedFields).length === 0) {
            return {
              code: HttpCode.BAD_REQUEST,
              message: 'No se proporcionó ninguna propiedad para actualizar.',
              data: null,
            };
          }
      
          await this.productsRepository.update(id, updatedFields);
          const updatedProduct = await this.productsRepository.findOne({
            where: { id },
            relations: ['image'],
          });
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              id: updatedProduct.id,
              name: updatedProduct.name,
              description: updatedProduct.description,
              price_sale_max: updatedProduct.price_sale_max,
              price_sale_min: updatedProduct.price_sale_min,
              image: updatedProduct.image ? updatedProduct.image.url : null,
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
        const existingProduct = await this.productsRepository.findOne({
          where: { id },
          relations: ['image'],
        });
    
        if (!existingProduct) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el producto con ID ${id}`,
            data: null,
          };
        }
    
        try {
          if (existingProduct.image) {
            try {
              await this.productsRepository.update(id, { image: null });
              await this.firebaseService.deleteFile(existingProduct.image.path);
            } catch (error) {
              if (error.code === 404) {
                console.log('Archivo no encontrado en Firebase, continuando...');
              } else {
                console.error('Error al eliminar el archivo de Firebase:', error);
              }
            }
            await this.fileRepository.delete(existingProduct.image.id);
          }
    
          await this.productsRepository.remove(existingProduct);
    
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: null,
          };
        } catch (error) {
          console.error('Error al eliminar el registro:', error);
          return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
          };
        }
      }
}
