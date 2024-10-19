import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { User } from 'src/common/entities/user.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/entities/role.entity';
import { MailsService } from 'src/common/modules/mails/services/mails.service';
import { ConfigService } from '@nestjs/config';
import { verify } from 'crypto';
// import { MailService } from 'src/common/services/mail.service';

@Injectable()
export class UsersService {

  private domain: string;
  private sendEmailNotification: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private mailService: MailsService,
    private configService: ConfigService
  ) {
    this.domain = this.configService.get<string>('DOMAIN');
    this.sendEmailNotification = this.configService.get<string>('SEND_EMAIL_NOTIFICATION');
  }

  async all(): Promise<ResponseDto>{
    try{
      const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.username',
        'user.name',
        'user.email',
        'role.id',
        'role.name',
      ]).getMany(); 

      const filteredUsers = users.map(user => ({
        value: user.id,
        label: `${user.name} - ${user.role.name}`,
        validate: user.name 
      }));

      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: filteredUsers,
      };

    }catch(error: any){
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseDto> {
    try {
      const { username, name, password, email, roleId, reset, passwordTemp, view_own_data  } = createUserDto;
      
      const existingUserByUsername = await this.userRepository.findOne({ where: { username } });
      const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
      const role = await this.roleRepository.findOne({ where: { id: roleId } });

      if(roleId){
        if (!role) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `El rol con ID ${roleId} no existe`,
            data: null,
          };
        }
      }

      if (existingUserByUsername && existingUserByEmail) {
        return {
          code: HttpCode.BAD_REQUEST,
          message: `El usuario ${username} y correo electrónico ${email} ya fueron registrados`
        };
      } else if(existingUserByUsername){
        return {
          code: HttpCode.BAD_REQUEST,
          message:  `El usuario ${username} ya fue registrado`
        };
      } else if(existingUserByEmail){
        return {
          code: HttpCode.BAD_REQUEST,
          message: `El correo electrónico ${email} ya fue registrado`
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userEntity = this.userRepository.create({
        username,
        name,
        password: hashedPassword,
        email,
        reset: reset,
        passwordTemp: passwordTemp,
        view_own_data: view_own_data,
        role: { id: roleId }
      });
      const savedUser = await this.userRepository.save(userEntity);

      if (savedUser) {
        const token = this.mailService.generateVerificationToken(savedUser.email);
        const verificationLink = `https://${this.domain}/authentication/verify?token=${token}`;
        const username = savedUser.username;

        await this.mailService.sendMail(
          this.sendEmailNotification,
          email,'Verificación de cuenta','verify-email',          
          { verificationLink, username },
        );
      }

      return {
        code: HttpCode.CREATED,
        message: HttpMessage.CREATED,
        data: {
          id: savedUser.id,
          email: savedUser.email,
          username: savedUser.username,
          role: {
            id: role?.id ? role.id: null,
            name: role?.name ? role?.name : null
          }
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

  async findAll(
    page: number,
    size: number,
    orderBy: string,
    sort: 'ASC' | 'DESC',
    filters: Partial<User>
  ): Promise<ResponsePageDto> {
    try {    

      const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role') // Hacemos el join con la entidad relacionada
      .select([
        'user.id',
        'user.username',
        'user.name',
        'user.email',
        'user.verifyEmail',
        'user.view_own_data',
        'role.id',
        'role.name',
      ])
      .skip(page * size)
      .take(size);

      Object.keys(filters).forEach((key) => {
        if (key !== 'password' && key !== 'reset' && key !== 'passwordTemp') {
          const value = filters[key];
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'string') {
              queryBuilder.andWhere(`user.${key} LIKE :${key}`, { [key]: `%${value}%` });
            } else {
              queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: value });
            }
          }
        }
      });

      const validOrderBys = [
        'id',
        'username',
        'name',
        'email',
        'verifyEmail',
        'view_own_data',
        'role',
      ];

      if (!validOrderBys.includes(orderBy)) {
        orderBy = 'user.id';
      } else {
        if (orderBy === 'role') {
          orderBy = 'role.name'; // Ordenar por 'role.name' cuando 'role' es pasado
        } else {
          orderBy = `user.${orderBy}`; // Ordenar por campo de usuario si no es 'role'
        }
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

  async findUser(identifier: string): Promise<ResponseDto> {
    try {
      let user;
      user = await this.userRepository
          .createQueryBuilder('user')
          .where('user.email = :identifier', { identifier })
          .orWhere('user.username = :identifier', { identifier })
          .leftJoinAndSelect('user.role', 'role')
          .getOne();

      if (!user) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `No existe el usuario con el identificador proporcionado: ${identifier}`,
          data: null,
        };
      }

      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: user,
      };
    } catch (error) {
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ResponseDto> {
    try {
      const user = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.username',
        'user.name',
        'user.email',
        'user.verifyEmail',
        'user.reset',
        'user.passwordTemp',
        'user.view_own_data',
        'role.id',
        'role.name',
      ]) // Excluir el campo 'password'
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el usuario con ID ${id}`,
        data: null,
      };
    }
    return {
      code: HttpCode.OK,
      message: HttpMessage.OK,
      data: {
        verifyEmail: user.verifyEmail,
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        reset: user.reset,
        passwordTemp: user.passwordTemp,
        view_own_data: user.view_own_data,
        roleId: user.role.id
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<ResponseDto> {
    const { username, email } = updateUserDto;

        const [existingUser, existingUserName, existingUserEmail] = await Promise.all([
        this.userRepository.findOne({
            where: { id }
        }),
        this.userRepository.findOne({
            where: { username }
        }),
        this.userRepository.findOne({
          where: { email }
      }),
        ]);

        if (!existingUser) {
        return {
            code: HttpCode.NOT_FOUND,
            message: `No existe el cliente con ID ${id}`,
            data: null,
        };
        }

        if (existingUserName && Number(existingUserName.id) !== Number(id)) {
        return {
            code: HttpCode.BAD_REQUEST,
            message: `El cliente con nombre ${username} ya fue registrado!`,
            data: null,
        };
        }

        if (existingUserEmail && Number(existingUserEmail.id) !== Number(id)) {
          return {
              code: HttpCode.BAD_REQUEST,
              message: `El cliente con email ${email} ya fue registrado!`,
              data: null,
          };
          }
  
    // Crear un objeto para almacenar solo las propiedades que deben actualizarse
    const updatedFields: Partial<User> = {};
  
    try {
      // Verificar y asignar las propiedades que no son nulas o indefinidas
      if (updateUserDto.name !== undefined && updateUserDto.name !== null) {
        updatedFields.name = updateUserDto.name;
      }
  
      if (updateUserDto.username !== undefined && updateUserDto.username !== null) {
        updatedFields.username = updateUserDto.username;
      }
  
      if (updateUserDto.password !== undefined && updateUserDto.password !== null) {
        updatedFields.password = await bcrypt.hash(updateUserDto.password, 10);
      }
  
      if (updateUserDto.email !== undefined && updateUserDto.email !== null) {
        updatedFields.email = updateUserDto.email;
      }

      if (updateUserDto.view_own_data !== undefined && updateUserDto.view_own_data !== null) {
        updatedFields.view_own_data = updateUserDto.view_own_data;
      }
  
      if (updateUserDto.roleId !== undefined && updateUserDto.roleId !== null) {
        const role = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
        if (!role) {
          return {
            code: HttpCode.NOT_FOUND,
            message: `El rol con ID ${updateUserDto.roleId} no existe`,
            data: null,
          };
        }
        updatedFields.role = role;
      }
  
      if (updateUserDto.reset !== undefined && updateUserDto.reset !== null) {
        updatedFields.reset = updateUserDto.reset;
      }
  
      if (updateUserDto.passwordTemp !== undefined && updateUserDto.passwordTemp !== null) {
        updatedFields.passwordTemp = updateUserDto.passwordTemp;
      }
  
      if (updateUserDto.verifyEmail !== undefined && updateUserDto.verifyEmail !== null) {
        updatedFields.verifyEmail = updateUserDto.verifyEmail;
      }
  
      // Verificar si se pasó alguna propiedad para actualizar
      if (Object.keys(updatedFields).length === 0) {
        return {
          code: HttpCode.BAD_REQUEST,
          message: 'No se proporcionó ninguna propiedad para actualizar.',
          data: null,
        };
      }
  
      // Actualizar solo las propiedades modificadas
      await this.userRepository.update(id, updatedFields);
  
      // Obtener el usuario actualizado para devolverlo en la respuesta
      const updatedUser = await this.userRepository.findOne({ where: { id }, relations: ['role'] });
  
      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        code: HttpCode.SERVICE_UNAVAILABLE,
        message: HttpMessage.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
  }
  
  async delete(id: number): Promise<ResponseDto> {
    
    if([1,2,3].includes(id)){
      return {
        code: HttpCode.CONTINUE,
        message: `No se permite eliminar usuarios maestros del sistema!`,
        data: null,
      };
    }

    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      return {
        code: HttpCode.NOT_FOUND,
        message: `No existe el usuario con ID ${id}`,
        data: null,
      };
    }

    try {
      await this.userRepository.remove(existingUser);
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

  async verifyUserEmail(email: string): Promise<ResponseDto> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return {
          code: HttpCode.CONTINUE,
          message: `¡Correo electrónico ${email} no registrado!`,
          data: null,
        };
      }

      user.verifyEmail = true;
      await this.userRepository.save(user);

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
