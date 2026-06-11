import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('api/employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  async getAllEmployees(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can view employee list');
    }
    const response = await lastValueFrom(
      this.client.send({ cmd: 'get-all-employees' }, {}),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Post()
  async createEmployee(@Req() req: any, @Body() body: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can create employees');
    }
    const response = await lastValueFrom(
      this.client.send({ cmd: 'create-employee' }, body),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Patch(':id')
  async updateEmployee(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can update employees');
    }
    const response = await lastValueFrom(
      this.client.send(
        { cmd: 'update-employee' },
        { id: parseInt(id, 10), ...body },
      ),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Delete(':id')
  async deleteEmployee(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete employees');
    }
    const response = await lastValueFrom(
      this.client.send(
        { cmd: 'delete-employee' },
        { id: parseInt(id, 10) },
      ),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }
}
