import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // 1. Tìm user theo email
    // 1. Tìm user theo email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra mật khẩu (Sử dụng trường "password_hash" từ DB)
    const dbPassword = user.password_hash;
    if (!dbPassword) {
      throw new UnauthorizedException(
        'Cấu trúc dữ liệu người dùng không hợp lệ',
      );
    }

    // So sánh mật khẩu
    const isPasswordMatching = await bcrypt.compare(password, dbPassword);
    //const isPasswordMatching = (password === dbPassword);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 3. Kiểm tra trạng thái user
    if (user.status && user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    // Trả về user (loại bỏ mật khẩu để bảo mật)
    const { password_hash: _p, ...result } = user;
    return result;
  }

  async login(user: any) {
    const userId = user._id?.toString();
    if (!userId) {
      throw new UnauthorizedException(
        'Cấu trúc dữ liệu người dùng không hợp lệ',
      );
    }

    const payload = {
      sub: userId,
      email: user.email,
      roleId: user.role_id,
      departmentId: user.department_id,
    };

    // Lấy config cho tokens
    const config = (this.jwtService as any).options || {};

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get<string>('auth.jwtRefreshExpiresIn') as any,
      }),
      user: {
        id: userId,
        fullName: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        roleId: user.role_id,
        departmentId: user.department_id,
      },
    };
  }
}
