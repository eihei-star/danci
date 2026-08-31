// ---------------------------------------------------------------------
// Mock 数据：结构与 docs/design.md §4 的数据库表结构一一对应。
//   books  —— 单词书表（id, title, wordCount, coverUrl, bookId, tags）
//   words  —— 单词表（id, wordRank, headWord, content, bookId）
//   progress —— learning_progress 表（userId, bookId, learnedCount,
//               lastWordRank, updatedAt）
//   content  —— 单词 JSON 完整内容，结构见 design §4.6
// ---------------------------------------------------------------------

// ---------- 单词 content 的类型 ----------
export interface WordSentence {
  sContent: string;
  sCn: string;
}
export interface WordTrans {
  tranCn: string;
  descCn?: string;
  descOther?: string;
  tranOther?: string;
}
export interface WordPhrase {
  pContent: string;
  pCn: string;
}
export interface WordSyno {
  pos?: string;
  tran?: string;
  hwds?: { w: string }[];
}
export interface WordRel {
  pos?: string;
  words?: { hwd: string; tran?: string }[];
}
export interface WordContent {
  sentence?: { sentences?: WordSentence[]; desc?: string };
  ukphone?: string;
  usphone?: string;
  ukspeech?: string;
  uspeech?: string;
  trans?: WordTrans[];
  phrase?: { phrases?: WordPhrase[]; desc?: string };
  syno?: { synos?: WordSyno[]; desc?: string };
  relWord?: { rels?: WordRel[]; desc?: string };
  remMethod?: { val?: string; desc?: string };
}

// ---------- 表结构 ----------
export interface Book {
  id: number;
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordRow {
  id: number;
  wordRank: number;
  headWord: string;
  content: { word: { wordHead: string; wordId: string; content: WordContent } };
  bookId: string;
}

export interface ProgressRow {
  id: number;
  userId: number;
  bookId: string;
  learnedCount: number;
  lastWordRank: number;
  updatedAt: string;
}

// 封面图（符合 web 图片资源规范）
const coverFor = (title: string, scene: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    scene,
  )}&image_size=landscape_4_3`;

// ---------- books ----------
export const mockBooks: Book[] = [
  {
    id: 1,
    title: '三年级上册',
    wordCount: 52,
    coverUrl: coverFor(
      '三年级上册',
      'children English vocabulary book cover, cute cartoon ruler pencil and apple, pastel background, Grade Three, flat design',
    ),
    bookId: 'PEPXiaoXue3_1',
    tags: 'PEP',
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-20T09:00:00.000Z',
  },
  {
    id: 2,
    title: '六年级上册',
    wordCount: 96,
    coverUrl: coverFor(
      '六年级上册',
      'children English vocabulary book cover, rainbow books and scenery, warm gradient, Grade Six, flat design',
    ),
    bookId: 'PEPXiaoXue6_1',
    tags: 'PEP',
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-20T09:00:00.000Z',
  },
];

// ---------- words ----------
export const mockWords: WordRow[] = [
  {
    id: 1,
    wordRank: 1,
    headWord: 'ruler',
    bookId: 'PEPXiaoXue3_1',
    content: {
      word: {
        wordHead: 'ruler',
        wordId: 'PEPXiaoXue3_1_1',
        content: {
          ukphone: "'ruːlə",
          usphone: "'rulɚ",
          ukspeech: 'ruler&type=1',
          uspeech: 'ruler&type=2',
          trans: [
            {
              tranCn: '尺子',
              descCn: '中释',
              descOther: '英释',
              tranOther:
                'a long flat object used to draw lines and measure things',
            },
          ],
          sentence: {
            sentences: [
              { sContent: 'Please use a ruler to draw a line.', sCn: '请用尺子画一条线。' },
            ],
            desc: '例句',
          },
          phrase: {
            phrases: [
              { pContent: 'a 12-inch ruler', pCn: '一把12英寸的尺子' },
              { pContent: 'a measuring ruler', pCn: '量尺' },
            ],
            desc: '短语',
          },
          syno: {
            synos: [{ pos: 'n', tran: '直尺；尺子', hwds: [{ w: 'rule' }, { w: 'measure' }] }],
            desc: '同近词',
          },
          relWord: {
            rels: [{ pos: 'n', words: [{ hwd: 'rule', tran: '规则；统治' }] }],
            desc: '同根词',
          },
          remMethod: {
            val: 'ruler 表示“尺子”，联想用尺子画出笔直的线段，制定一条“rule（规则）”。',
            desc: '记忆方法',
          },
        },
      },
    },
  },
  {
    id: 2,
    wordRank: 2,
    headWord: 'pencil',
    bookId: 'PEPXiaoXue3_1',
    content: {
      word: {
        wordHead: 'pencil',
        wordId: 'PEPXiaoXue3_1_2',
        content: {
          ukphone: "'pensl",
          usphone: "'pensl",
          ukspeech: 'pencil&type=1',
          uspeech: 'pencil&type=2',
          trans: [
            { tranCn: '铅笔', descCn: '中释', descOther: '英释', tranOther: 'an object used for writing, with wood and graphite' },
          ],
          sentence: {
            sentences: [{ sContent: 'I write my name with a pencil.', sCn: '我用铅笔写名字。' }],
            desc: '例句',
          },
          phrase: {
            phrases: [{ pContent: 'a pencil box', pCn: '铅笔盒' }],
            desc: '短语',
          },
          relWord: {
            rels: [{ pos: 'n', words: [{ hwd: 'pencil box', tran: '铅笔盒' }] }],
            desc: '同根词',
          },
          remMethod: { val: 'pencil 中的 pen 有“笔”的含义，铅笔是“penned（写）”时常用的工具。', desc: '记忆方法' },
        },
      },
    },
  },
  {
    id: 3,
    wordRank: 3,
    headWord: 'apple',
    bookId: 'PEPXiaoXue3_1',
    content: {
      word: {
        wordHead: 'apple',
        wordId: 'PEPXiaoXue3_1_3',
        content: {
          ukphone: "'æpl",
          usphone: "'æpl",
          ukspeech: 'apple&type=1',
          uspeech: 'apple&type=2',
          trans: [
            { tranCn: '苹果', descCn: '中释', descOther: '英释', tranOther: 'a round fruit with red or green skin' },
          ],
          sentence: {
            sentences: [{ sContent: 'The apple is red and sweet.', sCn: '这个苹果红红的、甜甜的。' }],
            desc: '例句',
          },
          phrase: {
            phrases: [{ pContent: 'an apple tree', pCn: '苹果树' }],
            desc: '短语',
          },
          syno: {
            synos: [{ pos: 'n', tran: '苹果', hwds: [{ w: 'fruit' }] }],
            desc: '同近词',
          },
          remMethod: { val: 'An apple a day keeps the doctor away.（一天一苹果，医生远离我。）', desc: '记忆方法' },
        },
      },
    },
  },
  {
    id: 4,
    wordRank: 1,
    headWord: 'weather',
    bookId: 'PEPXiaoXue6_1',
    content: {
      word: {
        wordHead: 'weather',
        wordId: 'PEPXiaoXue6_1_1',
        content: {
          ukphone: "'weðə",
          usphone: "'weðɚ",
          ukspeech: 'weather&type=1',
          uspeech: 'weather&type=2',
          trans: [
            { tranCn: '天气', descCn: '中释', descOther: '英释', tranOther: 'the condition of the air, such as hot or cold' },
          ],
          sentence: {
            sentences: [{ sContent: 'How is the weather today?', sCn: '今天天气怎么样？' }],
            desc: '例句',
          },
          phrase: {
            phrases: [{ pContent: 'weather forecast', pCn: '天气预报' }],
            desc: '短语',
          },
          syno: {
            synos: [{ pos: 'n', tran: '天气；气候', hwds: [{ w: 'climate' }] }],
            desc: '同近词',
          },
          relWord: {
            rels: [{ pos: 'n', words: [{ hwd: 'climate', tran: '气候' }] }],
            desc: '同根词',
          },
          remMethod: { val: 'weather 与 whether 发音相近，注意区分：天气看“weather”，是否问“whether”。', desc: '记忆方法' },
        },
      },
    },
  },
  {
    id: 5,
    wordRank: 2,
    headWord: 'hungry',
    bookId: 'PEPXiaoXue6_1',
    content: {
      word: {
        wordHead: 'hungry',
        wordId: 'PEPXiaoXue6_1_2',
        content: {
          ukphone: "'hʌŋɡri",
          usphone: "'hʌŋɡri",
          ukspeech: 'hungry&type=1',
          uspeech: 'hungry&type=2',
          trans: [{ tranCn: '饥饿的', descCn: '中释', descOther: '英释', tranOther: 'feeling that you want to eat something' }],
          sentence: {
            sentences: [{ sContent: 'I am very hungry now.', sCn: '我现在很饿。' }],
            desc: '例句',
          },
          phrase: {
            phrases: [{ pContent: 'be hungry for', pCn: '渴望' }],
            desc: '短语',
          },
          syno: {
            synos: [{ pos: 'adj', tran: '饥饿的', hwds: [{ w: 'starving' }] }],
            desc: '同近词',
          },
          remMethod: { val: 'hungry 的首字母 h 像一个人捂着肚子喊“饿(hungry)”。', desc: '记忆方法' },
        },
      },
    },
  },
];

// ---------- progress（learning_progress 表）----------
export const mockProgress: ProgressRow[] = [
  {
    id: 1,
    userId: 1,
    bookId: 'PEPXiaoXue3_1',
    learnedCount: 2,
    lastWordRank: 2,
    updatedAt: '2026-08-30T10:30:00.000Z',
  },
];

// ---------- 访问函数 ----------
export function getBooks(): Book[] {
  return mockBooks;
}

export function getBook(bookId: string): Book | undefined {
  return mockBooks.find((b) => b.bookId === bookId);
}

export function getWordsByBook(bookId: string): WordRow[] {
  return mockWords
    .filter((w) => w.bookId === bookId)
    .sort((a, b) => a.wordRank - b.wordRank);
}

export function getWord(bookId: string, wordRank: number): WordRow | undefined {
  return mockWords.find((w) => w.bookId === bookId && w.wordRank === wordRank);
}