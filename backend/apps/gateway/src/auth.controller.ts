import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto, LoginDto } from '@shared/index';
import { lastValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const response = await lastValueFrom(
      this.client.send({ cmd: 'register' }, dto),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const response = await lastValueFrom(
      this.client.send({ cmd: 'login' }, dto),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.UNAUTHORIZED);
    }
    return response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const response = await lastValueFrom(
      this.client.send({ cmd: 'get-me' }, { userId: req.user.id }),
    );
    if (response && response.error) {
      throw new HttpException(response.message, HttpStatus.UNAUTHORIZED);
    }
    return response;
  }
}
