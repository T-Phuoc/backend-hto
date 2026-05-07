import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PermissionAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'approve'
  | 'assign'
  | 'manage'
  | 'sync';

type DataScope =
  | 'all'
  | 'department'
  | 'assigned'
  | 'own'
  | 'partner'
  | 'public';

type PermissionGrant = {
  name: string;
  module: string;
  action: PermissionAction;
  dataScope: DataScope;
  description: string;
};

const ROLE_ADMIN = 'Admin';
const ROLE_BOARD = 'BGĐ';
const ROLE_DEPARTMENT_HEAD = 'Trưởng bộ phận';
const ROLE_HR = 'Nhân sự';
const ROLE_AGENT = 'Đại lý';
const ROLE_COLLABORATOR = 'CTV';

const defaultRoles = [
  {
    name: ROLE_ADMIN,
    description: 'Quản trị hệ thống',
  },
  {
    name: ROLE_BOARD,
    description: 'Ban giám đốc',
  },
  {
    name: ROLE_DEPARTMENT_HEAD,
    description: 'Quản lý bộ phận',
  },
  {
    name: ROLE_HR,
    description: 'Nhân sự nội bộ',
  },
  {
    name: ROLE_AGENT,
    description: 'Đối tác đại lý',
  },
  {
    name: ROLE_COLLABORATOR,
    description: 'Cộng tác viên',
  },
];

const rolePermissionMatrix: Record<string, PermissionGrant[]> = {
  [ROLE_ADMIN]: [
    ...grants('dashboard', 'all', ['read', 'export']),
    ...grants('departments', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('users', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'assign',
      'manage',
    ]),
    ...grants('roles', 'all', ['read', 'create', 'update', 'delete', 'manage']),
    ...grants('permissions', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('offices', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('products', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('partners', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'approve',
      'manage',
    ]),
    ...grants('schools', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('commission_policies', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'approve',
      'manage',
    ]),
    ...grants('crm_sync', 'all', ['read', 'sync']),
    ...grants('customers', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'export',
      'assign',
    ]),
    ...grants('leads', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'export',
      'assign',
    ]),
    ...grants('visa_profiles', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'export',
      'approve',
      'assign',
    ]),
    ...grants('marketing', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'approve',
      'manage',
    ]),
    ...grants('knowledge_base', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'manage',
    ]),
    ...grants('ai_logs', 'all', ['read', 'export']),
    ...grants('accounting', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'export',
      'approve',
      'manage',
    ]),
    ...grants('hr_recruitment', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'approve',
      'manage',
    ]),
  ],
  [ROLE_BOARD]: [
    ...grants('dashboard', 'all', ['read', 'export']),
    ...grants('departments', 'all', ['read']),
    ...grants('users', 'all', ['read']),
    ...grants('offices', 'all', ['read']),
    ...grants('products', 'all', ['read', 'update']),
    ...grants('partners', 'all', ['read', 'update', 'approve']),
    ...grants('schools', 'all', ['read', 'update']),
    ...grants('commission_policies', 'all', ['read', 'update', 'approve']),
    ...grants('crm_sync', 'all', ['read']),
    ...grants('customers', 'all', ['read', 'export']),
    ...grants('leads', 'all', ['read', 'export', 'assign']),
    ...grants('visa_profiles', 'all', ['read', 'export', 'approve', 'assign']),
    ...grants('marketing', 'all', ['read', 'approve']),
    ...grants('knowledge_base', 'all', ['read']),
    ...grants('ai_logs', 'all', ['read', 'export']),
    ...grants('accounting', 'all', ['read', 'export', 'approve']),
    ...grants('hr_recruitment', 'all', ['read', 'approve']),
  ],
  [ROLE_DEPARTMENT_HEAD]: [
    ...grants('dashboard', 'department', ['read', 'export']),
    ...grants('departments', 'department', ['read']),
    ...grants('users', 'department', ['read', 'assign']),
    ...grants('products', 'all', ['read']),
    ...grants('partners', 'department', ['read']),
    ...grants('commission_policies', 'department', ['read']),
    ...grants('customers', 'department', [
      'read',
      'create',
      'update',
      'export',
      'assign',
    ]),
    ...grants('leads', 'department', [
      'read',
      'create',
      'update',
      'export',
      'assign',
    ]),
    ...grants('visa_profiles', 'department', [
      'read',
      'create',
      'update',
      'export',
      'approve',
      'assign',
    ]),
    ...grants('knowledge_base', 'department', ['read', 'create', 'update']),
    ...grants('ai_logs', 'department', ['read']),
    ...grants('accounting', 'department', ['read', 'export']),
    ...grants('hr_recruitment', 'department', ['read', 'create', 'update']),
  ],
  [ROLE_HR]: [
    ...grants('dashboard', 'department', ['read']),
    ...grants('departments', 'all', ['read']),
    ...grants('users', 'all', ['read', 'create', 'update', 'assign']),
    ...grants('roles', 'all', ['read']),
    ...grants('offices', 'all', ['read']),
    ...grants('knowledge_base', 'all', ['read']),
    ...grants('hr_recruitment', 'all', [
      'read',
      'create',
      'update',
      'delete',
      'approve',
    ]),
  ],
  [ROLE_AGENT]: [
    ...grants('dashboard', 'partner', ['read']),
    ...grants('products', 'public', ['read']),
    ...grants('commission_policies', 'partner', ['read']),
    ...grants('customers', 'partner', ['read', 'create', 'update']),
    ...grants('leads', 'partner', ['read', 'create', 'update']),
    ...grants('visa_profiles', 'partner', ['read', 'create', 'update']),
    ...grants('marketing', 'public', ['read']),
    ...grants('knowledge_base', 'partner', ['read']),
    ...grants('accounting', 'partner', ['read', 'export']),
  ],
  [ROLE_COLLABORATOR]: [
    ...grants('dashboard', 'own', ['read']),
    ...grants('products', 'public', ['read']),
    ...grants('customers', 'own', ['read', 'create', 'update']),
    ...grants('leads', 'own', ['read', 'create', 'update']),
    ...grants('visa_profiles', 'own', ['read']),
    ...grants('marketing', 'public', ['read']),
    ...grants('knowledge_base', 'public', ['read']),
    ...grants('accounting', 'own', ['read']),
  ],
};

async function main(): Promise<void> {
  const rolesByName = new Map<string, { id: string }>();
  const permissionsByName = new Map<string, { id: string }>();
  const permissionRoleIds = new Map<string, string[]>();

  for (const role of defaultRoles) {
    const savedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        status: 'active',
      },
      create: {
        ...role,
        status: 'active',
        permissionIds: [],
      },
      select: { id: true },
    });

    rolesByName.set(role.name, savedRole);
  }

  const permissions = getUniquePermissions(rolePermissionMatrix);

  for (const permission of permissions) {
    const savedPermission = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
        module: permission.module,
        action: permission.action,
        dataScope: permission.dataScope,
      },
      create: {
        ...permission,
        roleIds: [],
      },
      select: { id: true },
    });

    permissionsByName.set(permission.name, savedPermission);
  }

  for (const [roleName, rolePermissions] of Object.entries(
    rolePermissionMatrix,
  )) {
    const role = rolesByName.get(roleName);

    if (!role) {
      continue;
    }

    const permissionIds = rolePermissions
      .map((permission) => permissionsByName.get(permission.name)?.id)
      .filter((permissionId): permissionId is string => Boolean(permissionId));

    await prisma.role.update({
      where: { name: roleName },
      data: { permissionIds },
    });

    for (const permission of rolePermissions) {
      const roleIds = permissionRoleIds.get(permission.name) ?? [];
      permissionRoleIds.set(permission.name, [...roleIds, role.id]);
    }
  }

  for (const [permissionName, roleIds] of permissionRoleIds.entries()) {
    await prisma.permission.update({
      where: { name: permissionName },
      data: { roleIds },
    });
  }

  console.log(
    `Seeded ${defaultRoles.length} default roles and ${permissions.length} permissions.`,
  );
}

function grants(
  module: string,
  dataScope: DataScope,
  actions: PermissionAction[],
): PermissionGrant[] {
  return actions.map((action) => ({
    name: `${module}:${action}:${dataScope}`,
    module,
    action,
    dataScope,
    description: `${getActionLabel(action)} ${getModuleLabel(module)} (${getDataScopeLabel(dataScope)})`,
  }));
}

function getUniquePermissions(
  matrix: Record<string, PermissionGrant[]>,
): PermissionGrant[] {
  const permissions = new Map<string, PermissionGrant>();

  for (const rolePermissions of Object.values(matrix)) {
    for (const permission of rolePermissions) {
      permissions.set(permission.name, permission);
    }
  }

  return Array.from(permissions.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function getActionLabel(action: PermissionAction): string {
  const labels: Record<PermissionAction, string> = {
    read: 'Xem',
    create: 'Tạo',
    update: 'Cập nhật',
    delete: 'Xóa',
    export: 'Xuất dữ liệu',
    approve: 'Phê duyệt',
    assign: 'Phân công',
    manage: 'Quản trị',
    sync: 'Đồng bộ',
  };

  return labels[action];
}

function getDataScopeLabel(dataScope: DataScope): string {
  const labels: Record<DataScope, string> = {
    all: 'toàn hệ thống',
    department: 'phạm vi phòng ban',
    assigned: 'được phân công',
    own: 'dữ liệu của mình',
    partner: 'dữ liệu đại lý',
    public: 'dữ liệu công khai',
  };

  return labels[dataScope];
}

function getModuleLabel(module: string): string {
  const labels: Record<string, string> = {
    accounting: 'kế toán',
    ai_logs: 'nhật ký AI',
    commission_policies: 'chính sách hoa hồng',
    crm_sync: 'đồng bộ CRM',
    customers: 'khách hàng',
    dashboard: 'dashboard/báo cáo',
    departments: 'phòng ban',
    hr_recruitment: 'tuyển dụng',
    knowledge_base: 'kho tri thức',
    leads: 'lead',
    marketing: 'marketing/content',
    offices: 'văn phòng đại diện',
    partners: 'đối tác/đại lý',
    permissions: 'quyền',
    products: 'sản phẩm/dịch vụ',
    roles: 'vai trò',
    schools: 'đối tác trường',
    users: 'người dùng',
    visa_profiles: 'hồ sơ visa/du học',
  };

  return labels[module] ?? module;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
