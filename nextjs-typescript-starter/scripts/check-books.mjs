import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.POSTGRES_URL + '?sslmode=require');
const cols = await client`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'books'
  ORDER BY ordinal_position
`;
const rowCount = await client`SELECT count(*)::int AS n FROM public.books`;
console.log('books columns:', JSON.stringify(cols, null, 2));
console.log('rows:', JSON.stringify(rowCount));
const sample = await client`SELECT * FROM public.books LIMIT 2`;
console.log('sample:', JSON.stringify(sample));
await client.end();