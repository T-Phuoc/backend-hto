import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoles = [
  {
    name: 'Admin',
    description: 'Quản trị hệ thống',
  },
  {
    name: 'BGĐ',
    description: 'Ban giám đốc',
  },
  {
    name: 'Trưởng bộ phận',
    description: 'Quản lý bộ phận',
  },
  {
    name: 'Nhân sự',
    description: 'Nhân sự nội bộ',
  },
  {
    name: 'Đại lý',
    description: 'Đối tác đại lý',
  },
  {
    name: 'CTV',
    description: 'Cộng tác viên',
  },
];

async function main(): Promise<void> {
  for (const role of defaultRoles) {
    await prisma.role.upsert({
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
    });
  }

  console.log(`Seeded ${defaultRoles.length} default roles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
