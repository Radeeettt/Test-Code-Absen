import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { AuthController } from './auth.controller';
import { AttendanceController } from './attendance.controller';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ClientsModule.register([
      {
        name: 'ATTENDANCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'wfh_attendance_secret_key_2026_gemini',
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AuthController, AttendanceController, EmployeeController],
})
export class GatewayModule {}
