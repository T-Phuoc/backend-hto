import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check() {
    await this.databaseService.getDb().command({ ping: 1 });

    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
