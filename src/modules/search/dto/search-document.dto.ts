import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDocumentDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (Tìm theo Tên, Mô tả, Tag, Danh mục hoặc Phòng ban)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Số lượng kết quả mỗi trang', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  page?: number = 1;
}
