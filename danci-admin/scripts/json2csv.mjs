import fs from 'node:fs/promises';
import path from 'node:path';

const inputPath = 'c:\\Users\\acer\\Desktop\\ai-coding\\danci\\danci-admin\\temp\\PEPXiaoXue6_1.json';
const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}.csv`);

function parseJsonRecords(text) {
  const records = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        records.push(JSON.parse(text.slice(start, index + 1)));
        start = -1;
      }
    }
  }

  return records;
}

function csvEscape(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

const input = await fs.readFile(inputPath, 'utf8');
const records = parseJsonRecords(input);
const rows = [
  ['wordRank', 'headWord', 'content', 'bookId'],
  ...records.map(({ wordRank, headWord, content, bookId }) => [
    wordRank,
    headWord,
    JSON.stringify(content),
    bookId,
  ]),
];

await fs.writeFile(
  outputPath,
  `\uFEFF${rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')}\r\n`,
  'utf8',
);

console.log(`已生成 ${records.length} 条记录：${outputPath}`);
