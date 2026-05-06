# Cấu trúc dự án backend-hto

Mục tiêu của cấu trúc này là để team thêm tính năng mới theo một format thống nhất, dễ review và dễ test.

## Cây thư mục chính

```text
src
├── app.module.ts
├── main.ts
├── common
│   ├── constants
│   ├── dto
│   ├── filters
│   ├── interceptors
│   └── interfaces
├── config
│   ├── app.config.ts
│   ├── database.config.ts
│   └── index.ts
├── database
│   ├── database.module.ts
│   └── database.service.ts
├── health
│   ├── health.controller.ts
│   └── health.module.ts
└── modules
    └── users
        └── users.module.ts
```

## Quy ước khi thêm feature

Mỗi tính năng mới đặt trong `src/modules/<feature-name>`.

Ví dụ module `properties`:

```text
src/modules/properties
├── dto
│   ├── create-property.dto.ts
│   └── update-property.dto.ts
├── properties.controller.ts
├── properties.module.ts
├── properties.repository.ts
└── properties.service.ts
```

Vai trò từng file:

```text
controller   Nhận request, validate DTO, gọi service
service      Chứa business logic
repository   Làm việc trực tiếp với MongoDB
dto          Định nghĩa input request
module       Khai báo controller/provider của feature
```

## Quy ước code

```text
Không đọc process.env trực tiếp trong service/controller
Không mở MongoDB connection trong controller hoặc repository
Không hardcode secret, password, token
Comment bằng tiếng Việt khi logic nghiệp vụ hoặc kỹ thuật dễ hiểu nhầm
Không comment lại điều code đã nói rõ
```

## Health check

Endpoint:

```text
GET /api/v1/health
```

Endpoint này ping MongoDB để kiểm tra app và database còn hoạt động.
