import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from './guards/jwt.guard';
import { lastValueFrom } from 'rxjs';

// Custom Multer Options to keep file extensions intact and generate unique names
const uploadOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname) || '.jpg';
      callback(null, `wfh-${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
    }
    callback(null, true);
  },
};

@Controller('api/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('clock-in')
  @UseInterceptors(FileInterceptor('photo', uploadOptions))
  async clockIn(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Photo proof is required to clock in', HttpStatus.BAD_REQUEST);
    }

    const userId = req.user.id;
    const now = new Date();
    
    // Formatting date (YYYY-MM-DD) and time (HH:MM:SS) in local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const payload = {
      userId,
      date: dateStr,
      time: timeStr,
      photoPath: `/uploads/${file.filename}`, // Serves relative to static mount
    };

    const response = await lastValueFrom(
      this.client.send({ cmd: 'clock-in' }, payload),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Post('clock-out')
  @UseInterceptors(FileInterceptor('photo', uploadOptions))
  async clockOut(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Photo proof is required to clock out', HttpStatus.BAD_REQUEST);
    }

    const userId = req.user.id;
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const payload = {
      userId,
      date: dateStr,
      time: timeStr,
      photoPath: `/uploads/${file.filename}`,
    };

    const response = await lastValueFrom(
      this.client.send({ cmd: 'clock-out' }, payload),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Get('today')
  async getTodayAttendance(@Req() req: any) {
    const userId = req.user.id;
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const response = await lastValueFrom(
      this.client.send({ cmd: 'get-today-attendance' }, { userId, date: dateStr }),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Get('history')
  async getAttendanceHistory(@Req() req: any) {
    const userId = req.user.id;
    const response = await lastValueFrom(
      this.client.send({ cmd: 'get-attendance-history' }, { userId }),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Get('admin/all')
  async getAllAttendances(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can access all logs');
    }

    const response = await lastValueFrom(
      this.client.send({ cmd: 'get-all-attendances' }, {}),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Delete('admin/all')
  async deleteAllAttendances(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete logs');
    }

    const response = await lastValueFrom(
      this.client.send({ cmd: 'delete-all-attendances' }, {}),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    // Delete physical files
    if (response && Array.isArray(response.photos)) {
      for (const photoPath of response.photos) {
        if (!photoPath) continue;
        const filename = photoPath.replace('/uploads/', '');
        const fullPath = join(process.cwd(), 'uploads', filename);
        try {
          if (existsSync(fullPath)) {
            unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(`Failed to delete physical file: ${fullPath}`, err);
        }
      }
    }

    return response;
  }

  @Delete('admin/:id')
  async deleteAttendance(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete logs');
    }

    const response = await lastValueFrom(
      this.client.send({ cmd: 'delete-attendance' }, { id: parseInt(id, 10) }),
    );

    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    // Delete physical files
    const deletePhoto = (photoPath: string) => {
      if (!photoPath) return;
      const filename = photoPath.replace('/uploads/', '');
      const fullPath = join(process.cwd(), 'uploads', filename);
      try {
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      } catch (err) {
        console.error(`Failed to delete physical file: ${fullPath}`, err);
      }
    };

    if (response) {
      deletePhoto(response.clockInPhoto);
      deletePhoto(response.clockOutPhoto);
    }

    return response;
  }
}
