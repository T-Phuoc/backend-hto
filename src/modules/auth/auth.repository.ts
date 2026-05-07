import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  // Nơi chứa các logic DB riêng của Auth (nếu có, ví dụ: lưu refresh token)
}
