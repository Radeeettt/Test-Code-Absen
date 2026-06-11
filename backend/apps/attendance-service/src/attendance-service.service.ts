import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Attendance } from '@shared/index';

@Injectable()
export class AttendanceServiceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    private readonly jwtService: JwtService,
  ) { }

  async register(data: {
    username: string;
    password: string;
    fullName: string;
    role?: 'employee' | 'admin';
  }) {
    const existing = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existing) {
      return { error: true, message: 'Username already exists' };
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      username: data.username,
      password: hashed,
      fullName: data.fullName,
      role: data.role || 'employee',
    });
    const saved = await this.userRepository.save(user);
    const { password: _, ...result } = saved;
    return { success: true, user: result };
  }

  async login(data: { username: string; password: string }) {
    const user = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (!user) {
      return { error: true, message: 'Invalid username or password' };
    }

    const isMatch = await bcrypt.compare(data.password, user.password!);
    if (!isMatch) {
      return { error: true, message: 'Invalid username or password' };
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async getMe(data: { userId: number }) {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });
    if (!user) {
      return { error: true, message: 'User not found' };
    }
    const { password: _, ...result } = user;
    return result;
  }

  async clockIn(data: {
    userId: number;
    date: string;
    time: string;
    photoPath: string;
  }) {
    const existing = await this.attendanceRepository.findOne({
      where: { userId: data.userId, date: data.date },
    });

    if (existing) {
      return { error: true, message: 'You have already clocked in today' };
    }

    const record = this.attendanceRepository.create({
      userId: data.userId,
      date: data.date,
      clockInTime: data.time,
      clockInPhoto: data.photoPath,
      status: 'present',
    });

    const saved = await this.attendanceRepository.save(record);
    return { success: true, attendance: saved };
  }

  async clockOut(data: {
    userId: number;
    date: string;
    time: string;
    photoPath: string;
  }) {
    const record = await this.attendanceRepository.findOne({
      where: { userId: data.userId, date: data.date },
    });

    if (!record) {
      return {
        error: true,
        message: 'No clock-in found for today. Please clock in first.',
      };
    }

    if (record.clockOutTime) {
      return { error: true, message: 'You have already clocked out today' };
    }

    record.clockOutTime = data.time;
    record.clockOutPhoto = data.photoPath;

    const saved = await this.attendanceRepository.save(record);
    return { success: true, attendance: saved };
  }

  async getTodayAttendance(data: { userId: number; date: string }) {
    const record = await this.attendanceRepository.findOne({
      where: { userId: data.userId, date: data.date },
    });
    return record || null;
  }

  async getAttendanceHistory(data: { userId: number }) {
    const records = await this.attendanceRepository.find({
      where: { userId: data.userId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
    return records;
  }

  async getAllAttendances() {
    const records = await this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoin('users', 'u', 'u.id = a.user_id')
      .select([
        'a.id AS id',
        'a.user_id AS userId',
        'u.full_name AS fullName',
        'u.username AS username',
        'a.date AS date',
        'a.clock_in_time AS clockInTime',
        'a.clock_out_time AS clockOutTime',
        'a.clock_in_photo AS clockInPhoto',
        'a.clock_out_photo AS clockOutPhoto',
        'a.status AS status',
        'a.created_at AS createdAt',
      ])
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.created_at', 'DESC')
      .getRawMany();

    return records;
  }

  async deleteAttendance(data: { id: number }) {
    const record = await this.attendanceRepository.findOne({
      where: { id: data.id },
    });
    if (!record) {
      return { error: true, message: 'Attendance record not found' };
    }
    const deleted = { ...record };
    await this.attendanceRepository.remove(record);
    return { success: true, ...deleted };
  }

  async deleteAllAttendances() {
    const all = await this.attendanceRepository.find();
    const photos = all.flatMap((r) =>
      [r.clockInPhoto, r.clockOutPhoto].filter(Boolean),
    );
    await this.attendanceRepository.clear();
    return { success: true, photos };
  }

  async getAllEmployees() {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password: _, ...u }) => u);
  }

  async createEmployee(data: {
    username: string;
    password: string;
    fullName: string;
    role?: 'employee' | 'admin';
  }) {
    const existing = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existing) {
      return { error: true, message: 'Username already exists' };
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      username: data.username,
      password: hashed,
      fullName: data.fullName,
      role: data.role || 'employee',
    });
    const saved = await this.userRepository.save(user);
    const { password: _, ...result } = saved;
    return { success: true, user: result };
  }

  async updateEmployee(data: {
    id: number;
    fullName?: string;
    username?: string;
    password?: string;
    role?: 'employee' | 'admin';
  }) {
    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) {
      return { error: true, message: 'Employee not found' };
    }

    if (data.fullName) user.fullName = data.fullName;
    if (data.username) user.username = data.username;
    if (data.role) user.role = data.role;
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    const saved = await this.userRepository.save(user);
    const { password: _, ...result } = saved;
    return { success: true, user: result };
  }

  async deleteEmployee(data: { id: number }) {
    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) {
      return { error: true, message: 'Employee not found' };
    }

    await this.attendanceRepository.delete({ userId: data.id });
    await this.userRepository.remove(user);
    return { success: true, message: 'Employee deleted successfully' };
  }
}
