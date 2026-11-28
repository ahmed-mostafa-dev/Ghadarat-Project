import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";



config({path : '.env'})

export const dataSourceOptions: DataSourceOptions = {
    type : 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',

// connection pool configuration
extra: {
    max: 20,                       // الحد الأقصى للاتصالات المتزامنة المفتوحة
    min: 5,                        // الحد الأدنى للاتصالات الجاهزة دائماً
    idleTimeoutMillis: 30000,      // مهلة غلق الاتصال الخامل
    connectionTimeoutMillis: 5000, // مهلة انتظار السيرفر للحصول على اتصال قبل إرجاع Timeout
}
}
const dataSource = new DataSource(dataSourceOptions);


export default dataSource;