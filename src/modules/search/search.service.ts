import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DatabaseService } from '../../database/database.service';
import { SearchDocumentDto } from './dto/search-document.dto';
import { ROLE_IDS } from '../../common/constants/role.constants';

@Injectable()
export class SearchService {
  constructor(private readonly databaseService: DatabaseService) { }

  private get documentCollection() {
    return this.databaseService.collection('documents');
  }

  async searchDocuments(query: SearchDocumentDto, user?: any) {
    const { keyword, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const filter: any = { deletedAt: null };

    // --- LOGIC TÌM KIẾM THÔNG MINH TRÊN 1 Ô DUY NHẤT ---
    if (keyword) {
      const searchRegex = { $regex: keyword, $options: 'i' };
      
      // 1. Tìm các Danh mục hoặc Phòng ban có tên chứa từ khóa
      const [categories, departments] = await Promise.all([
        this.databaseService.collection('document_categories').find({ name: searchRegex }).toArray(),
        this.databaseService.collection('departments').find({ name: searchRegex }).toArray()
      ]);

      const catIds = categories.flatMap(c => [c._id, c.id].filter(id => id != null));
      const deptIds = departments.flatMap(d => [d._id, d.id].filter(id => id != null));

      // 2. Xây dựng $or filter cho tất cả các trường
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { categoryId: { $in: catIds } },
        { category_id: { $in: catIds } },
        { departmentId: { $in: deptIds } },
        { department_id: { $in: deptIds } }
      ];
    }

    // --- LOGIC PHÂN QUYỀN (GIỮ NGUYÊN) ---
    const ROLE_ADMIN = ROLE_IDS.ADMIN;
    const ROLE_BGD = ROLE_IDS.BGD;

    if (!user) {
      filter.status = 'active';
      filter.required_role_id = { $in: [null, undefined, ''] };
    } else {
      const userRole = user.roleId || user.role_id;
      const userDept = user.departmentId || user.department_id;

      if (userRole !== ROLE_ADMIN && userRole !== ROLE_BGD) {
        const rbacConditions: any = {
          $and: [
            { $or: [{ departmentId: userDept }, { department_id: userDept }] },
            { 
              $or: [
                { required_role_id: userRole },
                { required_role_id: { $exists: false } },
                { required_role_id: null },
                { required_role_id: '' }
              ] 
            }
          ]
        };
        if (filter.$and) filter.$and.push(rbacConditions);
        else filter.$and = [rbacConditions];
      }
    }

    const [items, total] = await Promise.all([
      this.documentCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .toArray(),
      this.documentCollection.countDocuments(filter),
    ]);

    if (total === 0) {
      throw new NotFoundException('Quyền hạn bạn không đủ');
    }

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
