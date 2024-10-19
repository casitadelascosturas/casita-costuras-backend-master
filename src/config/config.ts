// src/config/config.ts

export default () => ({
  typeorm: {// configuraciones de base de datos
    type: process.env.TYPEORM_CONNECTION as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mongodb' | 'aurora-mysql' | 'aurora-postgres' | 'cockroachdb' | 'sap' | 'spanner' | 'mssql' | 'oracle' | 'cordova' | 'react-native' | 'nativescript' | 'sqljs' | 'expo' | 'better-sqlite3', // Especifica los tipos permitidos
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT, 10) || 3306,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [__dirname + '/../common/entities/**/*.entity{.ts,.js}'],
    seeds: [__dirname + '/../common/seeds/**/*{.ts,.js}'],
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    dropSchema: process.env.DROP_SCHEMA_DB === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    signOptions: { expiresIn: '7d' }, // Configuración de expiración del token
  },
  domain: process.env.DOMAIN, // Dominio para el envío de emails
  sendEmailNotification: process.env.SEND_EMAIL_NOTIFICATION, // Email para notificaciones
  prefixGlobalApi: process.env.PREFIX_GLOBAL_API, // Prefijo endpoints
  resend: {
    apiKey: process.env.RESEND_API_KEY, // Clave de API para envío de emails
  },
});
