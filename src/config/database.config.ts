import { registerAs } from '@nestjs/config';

const DEFAULT_DATABASE_NAME = 'hito_crm';

export default registerAs('database', () => {
  const uri = process.env.DATABASE_URL;

  return {
    uri,
    name: process.env.DATABASE_NAME ?? getDatabaseNameFromUri(uri),
  };
});

function getDatabaseNameFromUri(uri?: string): string {
  if (!uri) {
    return DEFAULT_DATABASE_NAME;
  }

  try {
    const parsedUrl = new URL(uri);
    const databaseName = parsedUrl.pathname.replace('/', '').trim();

    return databaseName || DEFAULT_DATABASE_NAME;
  } catch {
    // Không throw ở file config để tránh in connection string ra log.
    // DatabaseService sẽ kiểm tra và báo lỗi thiếu config rõ ràng khi app start.
    return DEFAULT_DATABASE_NAME;
  }
}
