import 'dotenv/config';
import postgres from 'postgres';
import { genSaltSync, hashSync, compare } from 'bcrypt-ts';

const client = postgres(process.env.POSTGRES_URL + '?sslmode=require');
const u = await client`SELECT id, email, password FROM "User" WHERE email = ${'authflow@example.com'}`;
console.log('row:', JSON.stringify(u));
if (u[0]) {
  console.log('compare("123456", hash) =', await compare('123456', u[0].password));
  // 复现 createUser 的哈希方式
  const salt = genSaltSync(10);
  const h = hashSync('123456', salt);
  console.log('hashSync length', h.length, 'fresh compare', await compare('123456', h));
  console.log('roundtrips: storedHash vs compare =', await compare('123456', u[0].password));
}
const all = await client`SELECT id, email, length(password) AS pwlen FROM "User" ORDER BY id`;
console.log('all users:', JSON.stringify(all));
await client.end();