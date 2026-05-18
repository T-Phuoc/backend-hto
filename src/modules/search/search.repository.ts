import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Filter, Sort } from 'mongodb';

@Injectable()
export class SearchRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get documentCollection() {
    return this.databaseService.collection('documents');
  }

  private get categoryCollection() {
    return this.databaseService.collection('document_categories');
  }

  private get departmentCollection() {
    return this.databaseService.collection('departments');
  }

  // Lọc mặc định cho các bản ghi chưa bị xóa
  private get notDeletedFilter() {
    return {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
  }

  async findCategories(filter: Filter<any>) {
    return await this.categoryCollection.find({ ...filter, ...this.notDeletedFilter }).toArray();
  }

  async findDepartments(filter: Filter<any>) {
    return await this.departmentCollection.find({ ...filter, ...this.notDeletedFilter }).toArray();
  }

  async findDocuments(filter: Filter<any>, options: { skip: number; limit: number; sort: Sort }) {
    const finalFilter = { ...filter, ...this.notDeletedFilter };
    return await this.documentCollection
      .find(finalFilter)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .toArray();
  }

  async countDocuments(filter: Filter<any>) {
    const finalFilter = { ...filter, ...this.notDeletedFilter };
    return await this.documentCollection.countDocuments(finalFilter);
  }
}
