import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceServiceController } from './attendance-service.controller';
import { AttendanceServiceService } from './attendance-service.service';
import { User, Attendance } from '@shared/index';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'wfh_attendance_db'),
        entities: [User, Attendance],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Attendance]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'wfh_attendance_secret_key_2026_gemini',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AttendanceServiceController],
  providers: [AttendanceServiceService],
})
export class AttendanceServiceModule { }
