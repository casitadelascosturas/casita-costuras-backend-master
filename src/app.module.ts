import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesModule } from './modules/resources/resources.module';
import { RolesModule } from './modules/roles/roles.module';
import { ResourcesRoleModule } from './modules/resources_role/resources_role.module';
import { UsersModule } from './modules/users/users.module';
import config from './config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { ClientsController } from './modules/clients/clients.controller';
import { ClientsModule } from './modules/clients/clients.module';
import { MeasuresModule } from './modules/measures/measures.module';
import { MeasuresServiceModule } from './modules/measures-service/measures-service.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductsStockModule } from './modules/products-stock/products-stock.module';
import { SewingServicesModule } from './modules/sewing-services/sewing-services.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SalesModule } from './modules/sales/sales.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { OffersModule } from './modules/offers/offers.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<'mysql' | 'postgres' | 'sqlite' | 'mariadb'>('typeorm.type'),
        host: configService.get<string>('typeorm.host'),
        port: configService.get<number>('typeorm.port'),
        username: configService.get<string>('typeorm.username'),
        password: configService.get<string>('typeorm.password'),
        database: configService.get<string>('typeorm.database'),
        entities: configService.get<string[]>('typeorm.entities'),
        synchronize: configService.get<boolean>('typeorm.synchronize'),
        dropSchema: configService.get<boolean>('typeorm.dropSchema'),
        seeds: configService.get<string[]>('typeorm.seeds'),
      }),
      inject: [ConfigService],
    }),
    ResourcesModule,
    RolesModule,
    ResourcesRoleModule,
    UsersModule,
    CommonModule,
    AuthModule,
    ClientsModule,
    MeasuresModule,
    MeasuresServiceModule,
    ProductsModule,
    ProductsStockModule,
    SewingServicesModule,
    OrdersModule,
    SalesModule,
    KpiModule,
    NotificationsModule,
    ReportsModule,
    ReceiptModule,
    OffersModule,
    TasksModule,
    ReservationsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
  exports:[]
})
export class AppModule {}
