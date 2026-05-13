import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) { }

  private get collection() {
    return this.databaseService.collection('users');
  }

  async findByEmail(email: string) {
    // Tìm kiếm user theo email trong MongoDB
    return await this.collection.findOne({ email, deletedAt: null });
  }

  async findById(id: string) {
    const idFilter = ObjectId.isValid(id)
      ? { $in: [new ObjectId(id), id] }
      : id;

    return await this.collection.findOne({
      _id: idFilter as any,
      deletedAt: null,
    });
  }
}
