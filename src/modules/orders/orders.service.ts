 import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Order } from 'src/common/entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Client } from 'src/common/entities/client.entity';
import { ProductOrder } from 'src/common/entities/product-order.entity';
import { ServiceOrder } from 'src/common/entities/service-order.entity';
import { MeasuresServiceOrder } from 'src/common/entities/measure-service-order.entity';
import { TasksEntity } from 'src/common/entities/tasks.entity';
import { User } from 'src/common/entities/user.entity';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { Service } from 'src/common/entities/service.entity';
import { Product } from 'src/common/entities/product.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Sale } from 'src/common/entities/sales.entity';

@Injectable()
export class OrdersService {

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        
        @InjectRepository(ProductOrder)
        private productOrderRepository: Repository<ProductOrder>,
        
        @InjectRepository(ServiceOrder)
        private serviceOrderRepository: Repository<ServiceOrder>,
        
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,

        @InjectRepository(Product)
        private productRepository: Repository<Product>,

        @InjectRepository(MeasuresServiceOrder)
        private measuresServiceOrderRepository: Repository<MeasuresServiceOrder>,
        
        @InjectRepository(TasksEntity)
        private tasksRepository: Repository<TasksEntity>,
        
        @InjectRepository(User)
        private userRepository: Repository<User>,
    
        @InjectRepository(Sale)
        private saleRepository: Repository<Sale>) {}
      
    async create(createOrderDto: CreateOrderDto): Promise<ResponseDto> {
        try {
            const {
                telephone,
                total,
                description,
                notify,
                creation_date,
                deliver_date,
                status,
                idUser,
                idClient,
                client,
                productOrders,
                serviceOrders,
            } = createOrderDto;
            let savedClient: Client | undefined;

            // 1. Validar usuario
            const user = await this.userRepository.findOne({ where: { id: idUser } });
            if (!user) {
                return { code: HttpCode.NOT_FOUND, message: 'Usuario no encontrado', data: null };
            }            

            // 2. Validar productos antes de crear la orden
            if (productOrders && productOrders.length > 0) {
                for (const productOrderDto of productOrders) {
                    const product = await this.productRepository.findOne({ where: { id: productOrderDto.idProduct } });
                    if (!product) {
                        return { code: HttpCode.NOT_FOUND, message: `Producto con ID ${productOrderDto.idProduct} no encontrado`, data: null };
                    }
                }
            }

            // 3. Validar servicios antes de crear la orden
            if (serviceOrders && serviceOrders.length > 0) {
                for (const serviceOrderDto of serviceOrders) {
                    const service = await this.serviceRepository.findOne({ where: { id: serviceOrderDto.idService } });
                    if (!service) {
                        return { code: HttpCode.NOT_FOUND, message: `Servicio con ID ${serviceOrderDto.idService} no encontrado`, data: null };
                    }
                }
            }
            // 4. Validar o crear cliente
            if (idClient) {
                savedClient = await this.clientRepository.findOne({ where: { id: idClient } });
                if (!savedClient) {
                    return { code: HttpCode.NOT_FOUND, message: 'Cliente no encontrado', data: null };
                }
            } else if (client) {
                savedClient = this.clientRepository.create({
                    name: client.name,
                    location: client.location,
                    email: client.email,
                    telephone: client.telephone,
                    whatsapp: client.whatsapp,
                });
                savedClient = await this.clientRepository.save(savedClient);
            }

            // Si todas las validaciones anteriores pasan, proceder con la creación de la orden
            const newOrder = this.orderRepository.create({
                telephone,
                total,
                description,
                notify,
                creation_date: new Date(creation_date),
                deliver_date: new Date(deliver_date),
                status: status || 'PENDING',
                client: savedClient,
                user: user,
            });

            const savedOrder = await this.orderRepository.save(newOrder);

            // 5. Guardar productos asociados a la orden
            if (productOrders && productOrders.length > 0) {
                for (const productOrderDto of productOrders) {
                    const product = await this.productRepository.findOne({ where: { id: productOrderDto.idProduct } });
                    const productOrder = this.productOrderRepository.create({
                        order: savedOrder,
                        product: product,
                        quantity: productOrderDto.quantity,
                        price_final: productOrderDto.price_final,
                        cost: 0
                    });
                    await this.productOrderRepository.save(productOrder);
                }
            }

            // 6. Guardar servicios asociados a la orden
            if (serviceOrders && serviceOrders.length > 0) {
                for (const serviceOrderDto of serviceOrders) {
                    const service = await this.serviceRepository.findOne({ where: { id: serviceOrderDto.idService } });

                    const newServiceOrder = this.serviceOrderRepository.create({
                        order: savedOrder,
                        service: service,
                        price_final: serviceOrderDto.price_final,
                        cost: Number(service.cost) + Number(service.cost_material)
                    });

                    const savedServiceOrder = await this.serviceOrderRepository.save(newServiceOrder);

                    // 7. Guardar mediciones asociadas al servicio
                    if (serviceOrderDto.measuresServiceOrders && serviceOrderDto.measuresServiceOrders.length > 0) {
                        for (const measureServiceOrderDto of serviceOrderDto.measuresServiceOrders) {
                            const newMeasureServiceOrder = this.measuresServiceOrderRepository.create({
                                serviceOrder: savedServiceOrder,
                                name_measures: measureServiceOrderDto.name_measures,
                                value_measures: measureServiceOrderDto.value_measures,
                            });
                            await this.measuresServiceOrderRepository.save(newMeasureServiceOrder);
                        }
                    }

                    // 8. Crear la tarea asociada al servicio
                    const taskDto = serviceOrderDto.task;
                    const newTask = this.tasksRepository.create({
                        payment: taskDto.payment_employee,
                        status: 'PENDING',
                        id_user_create: taskDto.id_user_create ? taskDto.id_user_create : null,
                        create_day: taskDto.create_day ? new Date(taskDto.create_day) : null,
                        init_day: taskDto.init_day ? new Date(taskDto.init_day) : null,
                        end_day: taskDto.end_day ? new Date(taskDto.end_day) : null,
                        serviceOrder: savedServiceOrder,
                        user: null,
                    });
                    await this.tasksRepository.save(newTask);
                }
            }

            // 7. Verificar si solo tiene productos y finalizar orden si no tiene servicios
            if (productOrders.length > 0 && serviceOrders.length === 0) {
                savedOrder.status = 'FINALIZED';
                await this.orderRepository.save(savedOrder);

                // Generar las ventas correspondientes para los productos
                for (const productOrder of productOrders) {
                    const product = await this.productRepository.findOne({ where: { id: productOrder.idProduct } });

                    const newSale = this.saleRepository.create({
                        order: savedOrder,
                        product: product,
                        client: savedOrder.client,
                        createdBy: savedOrder.user,
                        sale_date: new Date(),
                        total_amount: productOrder.price_final,
                        quantity: productOrder.quantity,
                        final_price: productOrder.price_final,
                    });

                    await this.saleRepository.save(newSale);
                }
            }

            return { code: HttpCode.OK, message: HttpMessage.OK, data: { id: savedOrder.id } };

        } catch (error) {
            console.log('Error al crear la orden: ', error);
            return { code: HttpCode.BAD_REQUEST, message: 'Error al crear la orden!', data: null };
        }
    }

    async page(page: number, size: number, orderBy: string, sort: 'ASC' | 'DESC', filters: Partial<Order> ): Promise<ResponsePageDto> {
            try {
                const queryBuilder = this.orderRepository.createQueryBuilder('order')
                    .leftJoinAndSelect('order.client', 'client')
                    .select([
                        'order.id',
                        'order.notify',
                        'order.creation_date',
                        'order.deliver_date',
                        'order.status',
                        'order.total',
                        'order.advance_payment',
                        'client.name'
                    ])
                    .skip(page * size)
                    .take(size);
    
                let creationDateRange = null;
                let deliverDateRange = null;
                // Aplicar filtros dinámicos
                Object.keys(filters).forEach((key) => {
                    const value = filters[key];
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'string' && key !== 'creation_date' && key !== 'deliver_date') {
                            queryBuilder.andWhere(`order.${key} LIKE :${key}`, { [key]: `%${value}%` });
                        }else if (key === 'creation_date' || key === 'deliver_date') {

                            const dateValue = new Date(value);
                            const startDate = new Date(dateValue.setHours(0, 0, 0, 0));
                            const endDate = new Date(dateValue.setHours(23, 59, 59, 999));

                            if(key === 'creation_date'){
                                creationDateRange = { start: startDate, end: endDate };
                            }else if(key === 'deliver_date'){
                                deliverDateRange = { start: startDate, end: endDate };
                            }  
                        } 
                        else {
                            queryBuilder.andWhere(`order.${key} = :${key}`, { [key]: value });
                        }
                    }
                });
    
                        // Aplicar filtros de fecha solo si existen ambos rangos
                if (creationDateRange && deliverDateRange) {
                    queryBuilder.andWhere(
                        `(order.creation_date BETWEEN :startCreation AND :endCreation AND order.deliver_date BETWEEN :startDeliver AND :endDeliver)`,
                        {
                            startCreation: creationDateRange.start.toISOString(),
                            endCreation: creationDateRange.end.toISOString(),
                            startDeliver: deliverDateRange.start.toISOString(),
                            endDeliver: deliverDateRange.end.toISOString(),
                        }
                    );
                } else if (creationDateRange) {
                    queryBuilder.andWhere(
                        `order.creation_date BETWEEN :startCreation AND :endCreation`,
                        {
                            startCreation: creationDateRange.start.toISOString(),
                            endCreation: creationDateRange.end.toISOString(),
                        }
                    );
                } else if (deliverDateRange) {
                    queryBuilder.andWhere(
                        `order.deliver_date BETWEEN :startDeliver AND :endDeliver`,
                        {
                            startDeliver: deliverDateRange.start.toISOString(),
                            endDeliver: deliverDateRange.end.toISOString(),
                        }
                    );
                }
                // Validar y aplicar ordenamiento
                const validOrderBys = ['id', 'creation_date', 'deliver_date', 'status'];
                if (!validOrderBys.includes(orderBy)) {
                    orderBy = 'order.id';  // Valor predeterminado
                } else {
                    orderBy = `order.${orderBy}`;
                }
                queryBuilder.orderBy(orderBy, sort);
    
                // Ejecutar consulta y obtener el resultado con conteo total
                const [orders, total] = await queryBuilder.getManyAndCount();
                const totalPages = Math.ceil(total / size);
    
                // Transformar datos en el formato solicitado
                const responseData = orders.map(order => {
                    // console.log('order: ', order)
                    const advancePayment = order.advance_payment || 0;
                    const pendingPayment = Number((Number(order.total)- advancePayment).toFixed(2));
                    // console.log('advancePayment: ', advancePayment);
                    // console.log('order.total: ', Number(order.total));
                    // console.log('pendingPayment: ', pendingPayment);
                
                    return {
                        id: order.id,
                        notify: order.notify,
                        creation_date: order.creation_date.toISOString(),
                        deliver_date: order.deliver_date.toISOString(),
                        status: order.status,
                        client: order.client ? order.client.name : null, // Solo el nombre del cliente
                        pending_payment: pendingPayment // Calcular el pago pendiente
                    };
                });
                
    
                // Retornar datos de la página
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
            const order = await this.orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.client', 'client')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.productOrders', 'productOrder')
                .leftJoinAndSelect('productOrder.product', 'product')
                .leftJoinAndSelect('order.serviceOrders', 'serviceOrder')
                .leftJoinAndSelect('serviceOrder.service', 'service')
                .leftJoinAndSelect('serviceOrder.measuresServiceOrders', 'measuresServiceOrder')
                .leftJoinAndSelect('serviceOrder.task', 'task')
                .where('order.id = :id', { id })
                .getOne();
    
            if (!order) {
                return { code: HttpCode.NOT_FOUND, message: 'Orden no encontrada', data: null };
            }
    
            const orderResponse = {
                telephone: order.telephone,
                description: order.description,
                notify: order.notify,
                creation_date: order.creation_date.toISOString(),
                deliver_date: order.deliver_date.toISOString(),
                advance_payment: order.advance_payment,
                idUser: order.user?.id,
                idClient: order.client?.id,
                status: order.status,
                total: order.total.toFixed(2),
                serviceOrders: order.serviceOrders?.map(serviceOrder => ({
                    idService: serviceOrder.service?.id,
                    price_final: serviceOrder.price_final.toFixed(2),
                    task: serviceOrder.task ? {
                        payment_employee: serviceOrder.task.payment,
                        idUser: serviceOrder.task.user?.id || null,
                        id_user_create: serviceOrder.task.id_user_create || null,
                        status: serviceOrder.task.status,
                        create_day: serviceOrder.task.create_day ? serviceOrder.task.create_day.toISOString() : null,
                        init_day: serviceOrder.task.init_day ? serviceOrder.task.init_day.toISOString() : null,
                        end_day: serviceOrder.task.end_day ? serviceOrder.task.end_day.toISOString() : null
                    } : null,
                    measuresServiceOrders: serviceOrder.measuresServiceOrders?.map(measure => ({
                        name_measures: measure.name_measures,
                        value_measures: measure.value_measures
                    }))
                })),
                productOrders: order.productOrders?.map(productOrder => ({
                    idProduct: productOrder.product?.id,
                    quantity: productOrder.quantity,
                    price_final: productOrder.price_final.toFixed(2)
                }))
            };
    
            return { code: HttpCode.OK, message: HttpMessage.OK, data: orderResponse };
    
        } catch (error) {
            console.error('Error al obtener la orden:', error);
            return { code: HttpCode.SERVICE_UNAVAILABLE, message: 'Error al obtener la orden', data: null };
        }
    }
    
    async update(id: number, updateOrderDto: UpdateOrderDto): Promise<ResponseDto> {
        try {
            const date: Date = new Date();
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['serviceOrders', 'serviceOrders.task', 'productOrders', 'productOrders.product', 'serviceOrders', 'serviceOrders.service', 'client', 'user'],
            });
    
            if (!order) {
                return { code: HttpCode.NOT_FOUND, message: 'Orden no encontrada', data: null };
            }
    
            const { notify, deliver_date, advance_payment, status } = updateOrderDto;
    
            if (notify !== undefined) {
                order.notify = notify;
            }
    
            if (deliver_date) {
                order.deliver_date = new Date(deliver_date);
            }
    
            if (advance_payment !== undefined) {
                order.advance_payment = advance_payment;
            }
    
            if (status === 'CANCEL') {
                order.status = 'CANCEL';
                order.completed_at = date;    
                const serviceOrders = order.serviceOrders;
    
                for (const serviceOrder of serviceOrders) {
                    if (serviceOrder.task) {
                        serviceOrder.task.status = 'CANCEL';
    
                        await this.tasksRepository.save(serviceOrder.task);
                    }
                }
            } else if (status) {    
                if(status === 'FINALIZED'){
                    order.deliver_date = date;  
                    order.advance_payment = order.total;
                    // Registrar ventas para cada producto
                    for (const productOrder of order.productOrders) {
                        const newSale = this.saleRepository.create({
                            order: order,
                            product: productOrder.product,
                            client: order.client,
                            createdBy: order.user,
                            sale_date: date,
                            total_amount: productOrder.price_final,
                            quantity: productOrder.quantity,
                            final_price: productOrder.price_final,
                        });
                        await this.saleRepository.save(newSale);
                    }
                    // Registrar ventas para cada servicio
                    for (const serviceOrder of order.serviceOrders) {
                        const newSale = this.saleRepository.create({
                            order: order,
                            service: serviceOrder.service,
                            client: order.client,
                            createdBy: order.user,
                            sale_date: date,
                            total_amount: serviceOrder.price_final,
                            final_price: serviceOrder.price_final,
                        });
                        await this.saleRepository.save(newSale);
                    }
                }         
                order.status = status;
            }
    
            const updatedOrder = await this.orderRepository.save(order);
    
            return { code: HttpCode.OK, message: HttpMessage.OK, data: updatedOrder };
    
        } catch (error) {
            console.error('Error al actualizar la orden:', error);
            return { code: HttpCode.SERVICE_UNAVAILABLE, message: 'Error al actualizar la orden', data: null };
        }
    }
    
    async generateReceipt(id: number){}

    async sendNotificationEmail(id: number, email: string){}

    async sendNotificationSms(id: number, email: string){}

}
