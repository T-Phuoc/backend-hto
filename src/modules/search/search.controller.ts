import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDocumentDto } from './dto/search-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('documents')
  @ApiOperation({ summary: 'Tìm kiếm tài liệu công khai' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tài liệu khớp với bộ lọc' })
  @ApiResponse({ status: 404, description: 'Quyền hạn bạn không đủ' })
  async publicSearch(@Query() query: SearchDocumentDto) {
    return this.searchService.searchDocuments(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents/private')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm tài liệu nội bộ (Yêu cầu đăng nhập)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tài liệu khớp với bộ lọc và phân quyền' })
  @ApiResponse({ status: 404, description: 'Quyền hạn bạn không đủ' })
  async privateSearch(
    @Query() query: SearchDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.searchService.searchDocuments(query, user);
  }
}
