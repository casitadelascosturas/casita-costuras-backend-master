import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { MeasuresServiceOrder } from 'src/common/entities/measure-service-order.entity';
import { ServiceOrder } from 'src/common/entities/service-order.entity';
import { TasksEntity } from 'src/common/entities/tasks.entity';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { Repository } from 'typeorm';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User } from 'src/common/entities/user.entity';
import { Order } from 'src/common/entities/order.entity';
import { Client } from 'src/common/entities/client.entity';
import { MailsService } from 'src/common/modules/mails/services/mails.service';
import { SmsService } from 'src/common/modules/sms/services/sms.service';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(TasksEntity)
        private tasksRepository: Repository<TasksEntity>,
        @InjectRepository(ServiceOrder)
        private serviceOrderRepository: Repository<ServiceOrder>,
        @InjectRepository(MeasuresServiceOrder)
        private measuresServiceOrderRepository: Repository<MeasuresServiceOrder>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        private mailService: MailsService,
        private smsService: SmsService) {}
      
    async page(
        page: number, 
        size: number, 
        orderBy: string, 
        sort: 'ASC' | 'DESC', 
        filters: Partial<TasksEntity>
      ): Promise<ResponsePageDto> {
        try {
          const queryBuilder = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.user', 'user') // Incluye al usuario
            .leftJoinAndSelect('task.serviceOrder', 'serviceOrder')
            // .leftJoinAndSelect('serviceOrder.service', 'service')
            .leftJoinAndSelect('serviceOrder.order', 'order')
            // .leftJoinAndSelect('serviceOrder.measuresServiceOrders', 'measuresServiceOrders')
            .skip(page * size)
            .take(size);
      
          // Filtrar por los campos proporcionados en el body
          Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
              if (key === 'user') {
                // Filtra por el nombre del usuario
                queryBuilder.andWhere('user.name LIKE :user', { user: `%${value}%` });
              } else {
                queryBuilder.andWhere(`task.${key} = :${key}`, { [key]: value });
              }
            }
          });
      
          // Ordenar los resultados
          const validOrderBys = ['id', 'status', 'create_day', 'init_day', 'end_day'];
          if (!validOrderBys.includes(orderBy)) {
            orderBy = 'task.id';  // Valor por defecto si el campo de orden no es válido
          } else {
            orderBy = `task.${orderBy}`;
          }
          queryBuilder.orderBy(orderBy, sort);
      
          // Ejecutar la consulta
          const [result, total] = await queryBuilder.getManyAndCount();
          const totalPages = Math.ceil(total / size);
      
          //   console.log('result: ', result);
          // Construir la respuesta
          const responseData = result.map(task => ({
            id: task.id,
            payment: Number(task.payment),
            status: task.status,
            create_day: task.create_day,
            init_day: task.init_day ?? null,
            end_day: task.end_day ?? null,
            user: task.user ? task.user.name : 'No asignado',
            // serviceOrderId: task.serviceOrder.id,
            orderId: task.serviceOrder.order.id,

            // serviceOrder: task.serviceOrder ? {
            //  serviceOrderId: task.serviceOrder.id,
            //   orderId: task.serviceOrder.order.id,
            // //   service: task.serviceOrder.service ? task.serviceOrder.service.name : null,
            // //   measures: task.serviceOrder.measuresServiceOrders?.map(measure => ({
            // //     id: measure.id,
            // //     name: measure.name_measures,
            // //     value: measure.value_measures,
            // //   })),
            // } : null,
          }));
      
          return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: {
              content: responseData,
              total,
              totalPages,
              currentPage: page,
              pageSize: size,
            },
          };
        } catch (error) {
          console.error('Error fetching tasks with pagination:', error);
          return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
          };
        }
    }
      
    async getTaskById(id: number): Promise<ResponseDto> {
        try {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['serviceOrder', 'serviceOrder.order', 'serviceOrder.service', 'serviceOrder.measuresServiceOrders', 'user'],
        });

        if (!task) {
            return {
            code: HttpCode.NOT_FOUND,
            message: `No se encontró la tarea con ID ${id}`,
            data: null,
            };
        }

        return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: task,
        };
        } catch (error) {
        return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
        };
        }
    }

    async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<ResponseDto> {
        // Encontrar la tarea existente
        const existingTask = await this.tasksRepository.findOne({
            where: { id },
            relations: ['user', 'serviceOrder', 'serviceOrder.order'],
        });
    
        if (!existingTask) {
            return {
                code: HttpCode.NOT_FOUND,
                message: `No se encontró la tarea con ID ${id}`,
                data: null,
            };
        }
    
        // Validar si se debe asignar un usuario antes de cambiar el estado
        const statusRequiringUser = ['IN_PROCESS', 'FINALIZED'];
        if (!existingTask.user && statusRequiringUser.includes(updateTaskDto.status)) {
            return {
                code: HttpCode.CONTINUE,
                message: `Debe asignar la tarea a un usuario antes de cambiar el estado!`,
                data: null,
            };
        }
    
        // Actualizar los campos de la tarea
        if (updateTaskDto.userId) {
            const user = await this.tasksRepository.manager.findOne(User, { where: { id: updateTaskDto.userId } });
            if (!user) {
                return {
                    code: HttpCode.NOT_FOUND,
                    message: `No se encontró el usuario con ID ${updateTaskDto.userId}`,
                    data: null,
                };
            }
            existingTask.user = user;
        }
    
        if (updateTaskDto.payment !== undefined) {
            existingTask.payment = updateTaskDto.payment;
        }
        if (updateTaskDto.init_day !== undefined) {
            existingTask.init_day = new Date(updateTaskDto.init_day);
        }
        if (updateTaskDto.end_day !== undefined) {
            existingTask.end_day = new Date(updateTaskDto.end_day);
        }
        if (updateTaskDto.status !== undefined) {
            existingTask.status = updateTaskDto.status;
        }
    
        try {
            // Guardar la tarea actualizada
            await this.tasksRepository.save(existingTask);
    
            // Volver a cargar todas las tareas de la orden, asegurándonos de que los cambios recientes estén incluidos
            const serviceOrder = await this.serviceOrderRepository.findOne({
                where: { id: existingTask.serviceOrder.id },
                relations: ['order', 'order.client', 'order.serviceOrders', 'order.serviceOrders.task'], // Incluye la relación con el cliente
            });

    
            // Si no se encuentra la orden, devolver un error
            if (!serviceOrder || !serviceOrder.order) {
                return {
                    code: HttpCode.NOT_FOUND,
                    message: `No se encontró la orden asociada a la tarea.`,
                    data: null,
                };
            }
    
            // Obtener todas las tareas actualizadas de la orden
            const allTasks = serviceOrder.order.serviceOrders.map(so => so.task);
    
            // Verificar el estado de las tareas para determinar el estado de la orden
            const areAllFinalized = allTasks.every(task => task.status === 'FINALIZED');
            const isAnyInProcess = allTasks.some(task => task.status === 'IN_PROCESS');
            const areAllPending = allTasks.every(task => task.status === 'PENDING');
    
            // Actualizar el estado de la orden según el estado de las tareas
            let newOrderStatus = serviceOrder.order.status;
            let newNotifyOrder = 0;

            if (areAllFinalized) {
                newOrderStatus = 'PENDING_DELIVERY';
                const telephone = serviceOrder.order.client.telephone;
                const email = serviceOrder.order.client.email;
                if(telephone && telephone !== ''){
                    newNotifyOrder++;
                    this.smsService
                    .sendSmsTwilio(telephone, `Hola, tu pedido #${serviceOrder.order.id} está listo para recoger. Horario: 9am-12:30pm y 3pm-5pm. ¡Gracias!`)
                    .then((response: any) => {
                        console.log('response twilio: ', response);
                    })
                    .catch((error) => {
                        console.log('error: ', error);
                    })
                    .finally(() => {
                        console.log('se finalizo el envio de sms twilio!')
                    })
                }
                if(email && email !== ''){
                    newNotifyOrder++;
                    this.mailService
                    .sendMail('', email, 'Pedido Finalizado', 'pending-order-deliver', {"id_order": String(serviceOrder.order.id)})
                    .then((response: any) => {
                        console.log('response resend: ', response);
                    })
                    .catch((error) => {
                        console.log('error: ', error);
                    })
                    .finally(() => {
                        console.log('se finalizo el envio de mail resend!')
                    })
                }
                
            } else if (isAnyInProcess) {
                newOrderStatus = 'IN_PROCESS';
            } else if (areAllPending) {
                newOrderStatus = 'PENDING';
            }
    
            // Solo actualizar la orden si el estado ha cambiado
            if (newOrderStatus !== serviceOrder.order.status) {
                const date: Date = new Date();
                serviceOrder.order.status = newOrderStatus;
                serviceOrder.order.notify = newNotifyOrder;
                if(newOrderStatus === 'PENDING_DELIVERY'){
                    serviceOrder.order.completed_at = date;
                }
                await this.orderRepository.save(serviceOrder.order); // Actualizar directamente desde el repositorio de `Order`
            }
    
            // Devolver la tarea actualizada con el nuevo estado de la orden
            const updatedTask = await this.tasksRepository.findOne({
                where: { id: existingTask.id },
                relations: ['serviceOrder', 'serviceOrder.service', 'serviceOrder.measuresServiceOrders'],
            });
    
            return {
                code: HttpCode.OK,
                message: HttpMessage.OK,
                data: updatedTask,
            };
        } catch (error) {
            console.error('Error actualizando la tarea y el estado de la orden:', error);
            return {
                code: HttpCode.SERVICE_UNAVAILABLE,
                message: HttpMessage.SERVICE_UNAVAILABLE,
                data: null,
            };
        }
    }
          
    // async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<ResponseDto> {
      
    //     const existingTask = await this.tasksRepository.findOne({
    //       where: { id },
    //       relations: ['user'],
    //     });
      
    //     if (!existingTask) {
    //       return {
    //         code: HttpCode.NOT_FOUND,
    //         message: `No se encontró la tarea con ID ${id}`,
    //         data: null,
    //       };
    //     } 
    //     const status: string[] = ['IN_PROCESS', 'FINALIZED'];
    //     if(!existingTask.user && status.includes(updateTaskDto.status)){
    //         return {
    //             code: HttpCode.CONTINUE,
    //             message: `Debe asignar la tarea a un usuario!`,
    //             data: null,
    //           };
    //     }
      
    //     if (updateTaskDto.userId) {
    //       const user = await this.tasksRepository.manager.findOne(User, { where: { id: updateTaskDto.userId } });
    //       if (!user) {
    //         return {
    //           code: HttpCode.NOT_FOUND,
    //           message: `No se encontró el usuario con ID ${updateTaskDto.userId}`,
    //           data: null,
    //         };
    //       }
    //       existingTask.user = user;
    //     }
      
    //     if (updateTaskDto.payment !== undefined) {
    //       existingTask.payment = updateTaskDto.payment;
    //     }
    //     if (updateTaskDto.init_day !== undefined) {
    //       existingTask.init_day = new Date(updateTaskDto.init_day);
    //     }
    //     if (updateTaskDto.end_day !== undefined) {
    //       existingTask.end_day = new Date(updateTaskDto.end_day);
    //     }
    //     if (updateTaskDto.status !== undefined) {
    //       existingTask.status = updateTaskDto.status;
    //     }
      
    //     try {
    //       const savedTask = await this.tasksRepository.save(existingTask);
    //       const updatedTask = await this.tasksRepository.findOne({
    //         where: { id: savedTask.id },
    //         relations: ['serviceOrder', 'serviceOrder.service', 'serviceOrder.measuresServiceOrders'],
    //       });
      
    //       return {
    //         code: HttpCode.OK,
    //         message: HttpMessage.OK,
    //         data: updatedTask,
    //       };

    //     } catch (error) {
    //       console.error('Error actualizando la tarea:', error);
    //       return {
    //         code: HttpCode.SERVICE_UNAVAILABLE,
    //         message: HttpMessage.SERVICE_UNAVAILABLE,
    //         data: null,
    //       };
    //     }
    // }
      
    }
