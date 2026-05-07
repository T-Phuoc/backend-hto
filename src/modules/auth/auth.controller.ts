import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // 1. Kiểm tra thông tin đăng nhập
    const user = await this.authService.validateUser(loginDto);
    
    // 2. Tạo và trả về JWT token
    return this.authService.login(user);
  }
}
