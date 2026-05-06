import { Controller, Get } from '@nestjs/common';
import { API_VERSION } from './common/constants/app.constants';

@Controller()
export class AppController {
  @Get()
  getRootInfo() {
    return {
      name: 'backend-hto',
      status: 'running',
      apiVersion: API_VERSION,
    };
  }
}
