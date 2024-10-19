import { DataSource } from 'typeorm';
import { SeederOptions } from 'typeorm-extension'; 
import { DataSourceOptions } from 'typeorm';

// Define las opciones de conexión junto con las opciones de seeders
const options: DataSourceOptions & SeederOptions = {
  type: 'mysql', // Cambia esto por el tipo de base de datos que estás usando (mysql, postgres, sqlite, etc.)
  host: process.env.TYPEORM_HOST || 'dev.api.lacasitadelascosturastipicas.com',
  port: parseInt(process.env.TYPEORM_PORT, 10) || 3306,
  username: process.env.TYPEORM_USERNAME || 'root',
  password: process.env.TYPEORM_PASSWORD || 'root',
  database: process.env.TYPEORM_DATABASE || 'CC_DB',
  entities: [__dirname + '/common/entities/*.entity{.ts,.js}'], // Usa una expresión global para todas las entidades
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // No utilizar en producción
  logging: true,
  seeds: ['src/common/seeds/**/*{.ts,.js}'], // Ruta de tus archivos de seeders
};

// Inicializa la fuente de datos
export const AppDataSource = new DataSource(options);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
