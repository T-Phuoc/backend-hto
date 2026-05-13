import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

async function run() {
  const client = new MongoClient('mongodb://localhost:27017/hto');
  try {
    await client.connect();
    const hash = await bcrypt.hash('12345678', 10);
    const result = await client.db().collection('users').updateOne(
      { email: 'datnk@gmail.com' },
      { $set: { password_hash: hash } }
    );
    if (result.matchedCount > 0) {
      console.log('Cập nhật mật khẩu thành công cho datnk@gmail.com: 12345678');
    } else {
      console.log('KHÔNG tìm thấy user với email: datnk@gmail.com');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
  } finally {
    await client.close();
    process.exit();
  }
}
run();
