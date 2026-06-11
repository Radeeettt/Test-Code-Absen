import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceServiceService } from './attendance-service.service';

@Controller()
export class AttendanceServiceController {
  constructor(
    private readonly attendanceServiceService: AttendanceServiceService,
  ) { }

  @MessagePattern({ cmd: 'register' })
  async register(
    @Payload()
    data: {
      username: string;
      password: string;
      fullName: string;
      role?: 'employee' | 'admin';
    },
  ) {
    return this.attendanceServiceService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Payload() data: { username: string; password: string },
  ) {
    return this.attendanceServiceService.login(data);
  }

  @MessagePattern({ cmd: 'get-me' })
  async getMe(@Payload() data: { userId: number }) {
    return this.attendanceServiceService.getMe(data);
  }

  @MessagePattern({ cmd: 'clock-in' })
  async clockIn(
    @Payload()
    data: {
      userId: number;
      date: string;
      time: string;
      photoPath: string;
    },
  ) {
    return this.attendanceServiceService.clockIn(data);
  }

  @MessagePattern({ cmd: 'clock-out' })
  async clockOut(
    @Payload()
    data: {
      userId: number;
      date: string;
      time: string;
      photoPath: string;
    },
  ) {
    return this.attendanceServiceService.clockOut(data);
  }

  @MessagePattern({ cmd: 'get-today-attendance' })
  async getTodayAttendance(
    @Payload() data: { userId: number; date: string },
  ) {
    return this.attendanceServiceService.getTodayAttendance(data);
  }

  @MessagePattern({ cmd: 'get-attendance-history' })
  async getAttendanceHistory(@Payload() data: { userId: number }) {
    return this.attendanceServiceService.getAttendanceHistory(data);
  }

  @MessagePattern({ cmd: 'get-all-attendances' })
  async getAllAttendances() {
    return this.attendanceServiceService.getAllAttendances();
  }

  @MessagePattern({ cmd: 'delete-attendance' })
  async deleteAttendance(@Payload() data: { id: number }) {
    return this.attendanceServiceService.deleteAttendance(data);
  }

  @MessagePattern({ cmd: 'delete-all-attendances' })
  async deleteAllAttendances() {
    return this.attendanceServiceService.deleteAllAttendances();
  }

  // ─── EMPLOYEE MANAGEMENT ─────────────────────
  @MessagePattern({ cmd: 'get-all-employees' })
  async getAllEmployees() {
    return this.attendanceServiceService.getAllEmployees();
  }

  @MessagePattern({ cmd: 'create-employee' })
  async createEmployee(
    @Payload()
    data: {
      username: string;
      password: string;
      fullName: string;
      role?: 'employee' | 'admin';
    },
  ) {
    return this.attendanceServiceService.createEmployee(data);
  }

  @MessagePattern({ cmd: 'update-employee' })
  async updateEmployee(
    @Payload()
    data: {
      id: number;
      fullName?: string;
      username?: string;
      password?: string;
      role?: 'employee' | 'admin';
    },
  ) {
    return this.attendanceServiceService.updateEmployee(data);
  }

  @MessagePattern({ cmd: 'delete-employee' })
  async deleteEmployee(@Payload() data: { id: number }) {
    return this.attendanceServiceService.deleteEmployee(data);
  }
}
