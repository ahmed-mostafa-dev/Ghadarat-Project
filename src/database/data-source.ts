import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";



config({path : '.env'})

export const dataSourceOptions: DataSourceOptions = {
    type : 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
}

const dataSource = new DataSource(dataSourceOptions);


export default dataSource;