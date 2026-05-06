import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, Document, MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client?: MongoClient;
  private database?: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.configService.get<string>('database.uri');
    const databaseName = this.configService.get<string>('database.name');

    if (!uri) {
      throw new Error('DATABASE_URL chưa được cấu hình trong file .env');
    }

    // Tạo một connection MongoDB dùng chung toàn app,
    // tránh mở connection mới ở từng request hoặc từng repository.
    this.client = new MongoClient(uri);
    await this.client.connect();

    this.database = this.client.db(databaseName);
    this.logger.log(`Đã kết nối MongoDB database: ${databaseName}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.close();
    this.logger.log('Đã đóng kết nối MongoDB');
  }

  getDb(): Db {
    if (!this.database) {
      throw new Error('MongoDB chưa sẵn sàng');
    }

    return this.database;
  }

  collection<TSchema extends Document = Document>(
    collectionName: string,
  ): Collection<TSchema> {
    return this.getDb().collection<TSchema>(collectionName);
  }
}
