import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet/wallet.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite usar ConfigService en cualquier módulo sin importarlo
    }),
    // 1. CONEXIÓN POR DEFECTO (Escritura - fintech_w)
    // Al no ponerle un 'name', TypeORM la toma como la principal.
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_WRITE_HOST'),
        port: configService.get<number>('DB_WRITE_PORT'),
        username: configService.get<string>('DB_WRITE_USERNAME'),
        password: configService.get<string>('DB_WRITE_PASSWORD'),
        database: configService.get<string>('DB_WRITE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      
    }),
    // 2. CONEXIÓN NOMBRADA (Lectura - fintech_r)
    // Usaremos el nombre 'readConnection' para inyectarla en los Repositorios de Lectura.
    TypeOrmModule.forRootAsync({
      name: 'readConnection', // <--- ESTO ES VITAL
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_READ_HOST'),
        port: configService.get<number>('DB_READ_PORT'),
        username: configService.get<string>('DB_READ_USERNAME'),
        password: configService.get<string>('DB_READ_PASSWORD'),
        database: configService.get<string>('DB_READ_NAME'),
        entities: [__dirname + '/**/*.view{.ts,.js}'], // Buenas prácticas: separar vistas de entidades
        synchronize: true, 
      }),
    }),
    WalletModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
