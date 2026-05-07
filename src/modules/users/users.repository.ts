import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get collection() {
    return this.databaseService.collection('users');
  }

  async findByEmail(email: string) {
    // Tìm kiếm user theo email trong MongoDB
    return await this.collection.findOne({ email, deletedAt: null });
  }

  async findById(id: string) {
    return await this.collection.findOne({ _id: id as any, deletedAt: null });
  }
}
