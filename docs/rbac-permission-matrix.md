# RBAC permission matrix

Tài liệu này định nghĩa ma trận quyền mặc định theo cấu trúc:

```text
role x module x action x dataScope
```

Permission được lưu theo convention:

```text
<module>:<action>:<dataScope>
```

Ví dụ:

```text
leads:read:department
visa_profiles:approve:all
customers:create:own
```

## Data scope

| Scope        | Ý nghĩa                                                      |
| ------------ | ------------------------------------------------------------ |
| `all`        | Toàn hệ thống.                                               |
| `department` | Dữ liệu thuộc phòng ban của user.                            |
| `assigned`   | Dữ liệu được phân công trực tiếp cho user.                   |
| `own`        | Dữ liệu do user tạo hoặc sở hữu.                             |
| `partner`    | Dữ liệu thuộc đại lý/đối tác đang đăng nhập.                 |
| `public`     | Dữ liệu công khai, dùng cho đại lý/CTV hoặc nội dung public. |

## Action

| Action    | Ý nghĩa                                                   |
| --------- | --------------------------------------------------------- |
| `read`    | Xem danh sách/chi tiết.                                   |
| `create`  | Tạo dữ liệu mới.                                          |
| `update`  | Cập nhật dữ liệu.                                         |
| `delete`  | Xóa hoặc soft-delete.                                     |
| `export`  | Xuất dữ liệu/báo cáo.                                     |
| `approve` | Phê duyệt, xác nhận, chuyển trạng thái quan trọng.        |
| `assign`  | Phân công người phụ trách hoặc chuyển owner.              |
| `manage`  | Quản trị cấu hình hoặc quyền quản lý cao hơn CRUD thường. |
| `sync`    | Đồng bộ dữ liệu với hệ thống ngoài.                       |

## Module

| Module                | Phạm vi dữ liệu                                      |
| --------------------- | ---------------------------------------------------- |
| `dashboard`           | Dashboard, báo cáo tổng quan.                        |
| `departments`         | Phòng ban.                                           |
| `users`               | Người dùng nội bộ.                                   |
| `roles`               | Vai trò.                                             |
| `permissions`         | Permission.                                          |
| `offices`             | Văn phòng đại diện.                                  |
| `products`            | Sản phẩm/dịch vụ, category, cost, requirement, step. |
| `partners`            | Đại lý, CTV, đối tác.                                |
| `schools`             | Đối tác trường.                                      |
| `commission_policies` | Chính sách hoa hồng.                                 |
| `crm_sync`            | Đồng bộ CRM/Bizfly.                                  |
| `customers`           | Khách hàng.                                          |
| `leads`               | Lead.                                                |
| `visa_profiles`       | Hồ sơ visa/du học.                                   |
| `marketing`           | News, webinar, FAQ, HITO tips.                       |
| `knowledge_base`      | Danh mục tài liệu và tài liệu tri thức.              |
| `ai_logs`             | Nhật ký AI assistant.                                |
| `accounting`          | Giao dịch kế toán.                                   |
| `hr_recruitment`      | Tuyển dụng nhân sự.                                  |

## Matrix

Ký hiệu trong bảng:

```text
action(scope)
```

Ví dụ `read/update(all)` nghĩa là được `read` và `update` với scope `all`.

| Module                | Admin                                                | BGĐ                             | Trưởng bộ phận                                       | Nhân sự                                | Đại lý                      | CTV                     |
| --------------------- | ---------------------------------------------------- | ------------------------------- | ---------------------------------------------------- | -------------------------------------- | --------------------------- | ----------------------- |
| `dashboard`           | read/export(all)                                     | read/export(all)                | read/export(department)                              | read(department)                       | read(partner)               | read(own)               |
| `departments`         | read/create/update/delete/manage(all)                | read(all)                       | read(department)                                     | read(all)                              | -                           | -                       |
| `users`               | read/create/update/delete/assign/manage(all)         | read(all)                       | read/assign(department)                              | read/create/update/assign(all)         | -                           | -                       |
| `roles`               | read/create/update/delete/manage(all)                | -                               | -                                                    | read(all)                              | -                           | -                       |
| `permissions`         | read/create/update/delete/manage(all)                | -                               | -                                                    | -                                      | -                           | -                       |
| `offices`             | read/create/update/delete/manage(all)                | read(all)                       | -                                                    | read(all)                              | -                           | -                       |
| `products`            | read/create/update/delete/manage(all)                | read/update(all)                | read(all)                                            | -                                      | read(public)                | read(public)            |
| `partners`            | read/create/update/delete/approve/manage(all)        | read/update/approve(all)        | read(department)                                     | -                                      | -                           | -                       |
| `schools`             | read/create/update/delete/manage(all)                | read/update(all)                | -                                                    | -                                      | -                           | -                       |
| `commission_policies` | read/create/update/delete/approve/manage(all)        | read/update/approve(all)        | read(department)                                     | -                                      | read(partner)               | -                       |
| `crm_sync`            | read/sync(all)                                       | read(all)                       | -                                                    | -                                      | -                           | -                       |
| `customers`           | read/create/update/delete/export/assign(all)         | read/export(all)                | read/create/update/export/assign(department)         | -                                      | read/create/update(partner) | read/create/update(own) |
| `leads`               | read/create/update/delete/export/assign(all)         | read/export/assign(all)         | read/create/update/export/assign(department)         | -                                      | read/create/update(partner) | read/create/update(own) |
| `visa_profiles`       | read/create/update/delete/export/approve/assign(all) | read/export/approve/assign(all) | read/create/update/export/approve/assign(department) | -                                      | read/create/update(partner) | read(own)               |
| `marketing`           | read/create/update/delete/approve/manage(all)        | read/approve(all)               | -                                                    | -                                      | read(public)                | read(public)            |
| `knowledge_base`      | read/create/update/delete/manage(all)                | read(all)                       | read/create/update(department)                       | read(all)                              | read(partner)               | read(public)            |
| `ai_logs`             | read/export(all)                                     | read/export(all)                | read(department)                                     | -                                      | -                           | -                       |
| `accounting`          | read/create/update/delete/export/approve/manage(all) | read/export/approve(all)        | read/export(department)                              | -                                      | read/export(partner)        | read(own)               |
| `hr_recruitment`      | read/create/update/delete/approve/manage(all)        | read/approve(all)               | read/create/update(department)                       | read/create/update/delete/approve(all) | -                           | -                       |

## Guard rule đề xuất

Khi implement authorization guard:

1. Route khai báo `module` và `action` bắt buộc.
2. Guard lấy danh sách permission của user từ role và `permissionOverrides`.
3. Nếu có permission cùng `module/action`, guard kiểm tra `dataScope`.
4. `all` luôn rộng nhất.
5. `department`, `assigned`, `own`, `partner`, `public` phải được service/repository áp filter dữ liệu tương ứng.
6. `permissionOverrides.isDenied = true` phải ưu tiên hơn quyền được cấp từ role.

Không nên chỉ check role name trong controller. Controller chỉ nên khai báo permission cần thiết; phần so sánh scope nằm ở guard/policy layer.
