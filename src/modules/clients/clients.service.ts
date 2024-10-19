import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/common/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ResponseDto } from 'src/common/dto/response.dto';
import { PossibleValueSelect } from 'src/common/possible-value-selecct';


@Injectable()
export class ClientsService {

    constructor(@InjectRepository(Client)
       private readonly clientRepository: Repository<Client>) {}

    
    async create(createClientDto: CreateClientDto): Promise<ResponseDto> {
        try {
            const { name, location, email, telephone, whatsapp  } = createClientDto;
            const existingClientByName = await this.clientRepository.findOne({ where: { name } });

            if(existingClientByName){
                return {
                    code: HttpCode.BAD_REQUEST,
                    message: `El cliente con el nombre: ${name}, ya fue registrado.`
                  };
            }

            const userEntity = this.clientRepository.create({
                name,
                location,
                email,
                telephone,
                whatsapp
              });

            const savedClient = await this.clientRepository.save(userEntity);

            return {
                code: HttpCode.CREATED,
                message: HttpMessage.CREATED,
                data: {
                  id: savedClient.id,
                  name: savedClient.name,
                  location: savedClient.location,
                  email: savedClient.email,
                  telephone: savedClient.telephone,
                  whatsapp: savedClient.whatsapp
                },
            };

        } catch(error){
            return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: HttpMessage.SERVICE_UNAVAILABLE,
                data: null
            }
        }
    }

    async page(
        page: number, size: number, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Client>): Promise<ResponsePageDto> {
        try {
            console.log('page: ', page);
            console.log('size: ', size);
            console.log('orderBy: ', orderBy);
            console.log('sort: ', sort);
            console.log('filters: ', filters);
              
          const queryBuilder = this.clientRepository.createQueryBuilder('client')
          .select([
            'client.id',
            'client.name',
            'client.location',
            'client.email',
            'client.telephone',
            'client.whatsapp'
          ])
          .skip(page * size)
          .take(size);
    
          Object.keys(filters).forEach((key) => {
            const value = filters[key];
              if (value !== null && value !== undefined && value !== '') {
                if (typeof value === 'string') {
                  queryBuilder.andWhere(`client.${key} LIKE :${key}`, { [key]: `%${value}%` });
                } else {
                  queryBuilder.andWhere(`client.${key} = :${key}`, { [key]: value });
                }
              }
          });
    
          const validOrderBys = [
            'id',
            'name',
            'location',
            'email',
            'telephone',
            'whatsapp'
          ];
    
          if (!validOrderBys.includes(orderBy)) {
            orderBy = 'client.id';
          } else {
            orderBy = `client.${orderBy}`;
          }
          
          queryBuilder.orderBy(orderBy, sort);
    
          // Ejecutamos la consulta y obtenemos los resultados
          const [result, total] = await queryBuilder.getManyAndCount();
          const totalPages = Math.ceil(total / size);
    
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              content: result,
              total: total,
              totalPages: totalPages, // Total de páginas
              currentPage: page, // Página actual
              pageSize: size // Tamaño de la página
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
        try {
          const user = await this.clientRepository.createQueryBuilder('client')
          .select([
            'client.id',
            'client.name',
            'client.location',
            'client.email',
            'client.telephone',
            'client.whatsapp'])
          .where('client.id = :id', { id })
          .getOne();
    
        if (!user) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el cliente con ID ${id}`,
            data: null,
          };
        }
        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: {
            id: user.id,
            name: user.name,
            location: user.location,
            telephone: user.telephone,
            whatsapp: user.whatsapp
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

    async update(id: number, updateUserDto: UpdateClientDto): Promise<ResponseDto> {

        const { name } = updateUserDto;

        const [existingClient, existingClientName] = await Promise.all([
        this.clientRepository.findOne({
            where: { id }
        }),
        this.clientRepository.findOne({
            where: { name }
        }),
        ]);

        if (!existingClient) {
        return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el cliente con ID ${id}`,
            data: null,
        };
        }

        if (existingClientName && Number(existingClientName.id) !== Number(id)) {
        return {
            code: HttpCode.BAD_REQUEST,
            message: `El cliente con nombre ${name} ya fue registrado!`,
            data: null,
        };
        }
      
        // Crear un objeto para almacenar solo las propiedades que deben actualizarse
        const updatedFields: Partial<Client> = {};
      
        try {
          // Verificar y asignar las propiedades que no son nulas o indefinidas
          if (updateUserDto.name !== undefined && updateUserDto.name !== null) {
            updatedFields.name = updateUserDto.name;
          }
      
          if (updateUserDto.location !== undefined && updateUserDto.location !== null) {
            updatedFields.location = updateUserDto.location;
          }
      
          if (updateUserDto.email !== undefined && updateUserDto.email !== null) {
            updatedFields.email = updateUserDto.email;
          }

          if (updateUserDto.telephone !== undefined && updateUserDto.telephone !== null) {
            updatedFields.telephone = updateUserDto.telephone;
          }

          if (updateUserDto.whatsapp !== undefined && updateUserDto.whatsapp !== null) {
            updatedFields.whatsapp = updateUserDto.whatsapp;
          }
      
          if (Object.keys(updatedFields).length === 0) {
            return {
              code: HttpCode.BAD_REQUEST,
              message: 'No se proporcionó ninguna propiedad para actualizar.',
              data: null,
            };
          }
      
          await this.clientRepository.update(id, updatedFields);      
          const updatedClient = await this.clientRepository.findOne({ where: { id }});
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: updatedClient,
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
        const existingClient = await this.clientRepository.findOne({ where: { id } });
        if (!existingClient) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el cliente con ID ${id}`,
            data: null,
          };
        }
    
        try {
          await this.clientRepository.remove(existingClient);
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

    //CUSTOM ENDPOINTS ---CLIENT BY NAME
    
    async searchByName(name: string): Promise<ResponseDto> {
      try {
        
        console.log('name: ', name)
          // Realizar la consulta para buscar clientes cuyo nombre contiene el valor de `name`
          const clients = await this.clientRepository
              .createQueryBuilder('client')
              .select(['client.id', 'client.name'])
              .where('client.name LIKE :name', { name: `%${name}%` }) // Búsqueda por coincidencias parciales
              .getMany();

          // Formatear el resultado de acuerdo a la interfaz `PossibleValueSelect`
          const formattedResult: PossibleValueSelect[] = clients.map((client) => ({
              label: client.name,
              value: client.id,
          }));

          return {
              code: HttpCode.OK,
              message: HttpMessage.OK,
              data: formattedResult,
          };
      } catch (error) {
          console.error('Error en el método searchByName:', error);
          return {
              code: HttpCode.SERVICE_UNAVAILABLE,
              message: HttpMessage.SERVICE_UNAVAILABLE,
              data: null,
          };
      }
  }

}
