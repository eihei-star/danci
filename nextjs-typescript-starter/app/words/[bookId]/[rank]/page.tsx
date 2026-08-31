'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWords } from 'app/lib/api';
import type { WordRow } from 'app/lib/mock-data';

export default function WordDetailPage() {
  const params = useParams();
  const bookId = String(params.bookId);
  const rank = Number(params.rank);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // 通过 bookId+rank 从真实 words 数据中取单词
  const [word, setWord] = useState<WordRow | undefined>();
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchWords(bookId);
        if (cancelled) return;
        setWord(data.words.find((w) => w.wordRank === rank));
        setBookTitle(data.book?.title ?? '单词');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, rank]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-gray-400">
        加载中…
      </div>
    );
  }
  if (!word) return <NotFound onBack={() => router.back()} />;

  const c = word.content.word.content;
  const audioBase = process.env.NEXT_PUBLIC_AUDIO_BASE || 'https://dict.youdao.com/dictvoice?audio=';

  const play = (speech?: string) => {
    if (!speech || !audioRef.current) return;
    audioRef.current.src = `${audioBase}${speech}`;
    audioRef.current.play();
  };

  return (
    <div className="min-h-screen pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <audio ref={audioRef} preload="none" />

      {/* 顶部：返回 + 单词 */}
      <header className="flex items-center gap-3 bg-gray-50 px-4 py-4">
        <button
          onClick={() => router.back()}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-600 shadow-sm"
        >
          ←
        </button>
        <p className="text-base font-semibold text-gray-900">
          {bookTitle}
        </p>
      </header>

      <main className="px-4">
        {/* 单词 / 音标 / 发音 */}
        <section className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-3xl font-bold text-gray-900">{word.headWord}</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-base text-gray-500">
            {c.ukphone && <span>英 /{c.ukphone}/</span>}
            {c.usphone && <span>美 /{c.usphone}/</span>}
          </p>
          <div className="mt-3 flex justify-center gap-3">
            {c.ukspeech && (
              <PronounceBtn label="英" onClick={() => play(c.ukspeech)} />
            )}
            {c.uspeech && (
              <PronounceBtn label="美" onClick={() => play(c.uspeech)} />
            )}
          </div>
          {(c.trans?.[0]?.tranCn || '') && (
            <p className="mt-4 text-2xl font-semibold text-indigo-600">
              {c.trans?.[0]?.tranCn}
            </p>
          )}
        </section>

        {/* 释义 */}
        <DetailItem title="释义">
          {c.trans?.map((t, i) => (
            <div key={i}>
              <p className="text-gray-900">{t.tranCn}</p>
              {t.tranOther && (
                <p className="mt-0.5 text-sm text-gray-500">{t.tranOther}</p>
              )}
            </div>
          ))}
        </DetailItem>

        {/* 例句 */}
        <DetailItem title="例句">
          {c.sentence?.sentences?.map((s, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-gray-900">{s.sContent}</p>
              <p className="text-sm text-gray-500">{s.sCn}</p>
            </div>
          ))}
        </DetailItem>

        {/* 短语 */}
        <DetailItem title="短语">
          {c.phrase?.phrases?.map((p, i) => (
            <p key={i} className="text-gray-900">
              <span className="font-medium">{p.pContent}</span>
              {p.pCn && <span className="ml-2 text-gray-500">{p.pCn}</span>}
            </p>
          ))}
        </DetailItem>

        {/* 同近词 */}
        <DetailItem title="同近词">
          {c.syno?.synos?.map((s, i) => (
            <p key={i} className="text-gray-900">
              <span className="font-medium">
                {s.hwds?.map((h) => h.w).join(' / ')}
              </span>
              {s.tran && <span className="ml-2 text-gray-500">{s.tran}</span>}
            </p>
          ))}
        </DetailItem>

        {/* 同根词（按词性分组） */}
        <DetailItem title="同根词">
          {c.relWord?.rels?.map((r, i) => (
            <div key={i}>
              <p className="text-xs text-gray-400">
                {r.pos ? `[${r.pos}]` : ''}
              </p>
              <p className="mt-0.5 text-gray-900">
                {r.words?.map((w) => `${w.hwd}${w.tran ? ' ' + w.tran : ''}`).join('；')}
              </p>
            </div>
          ))}
        </DetailItem>

        {/* 记忆方法 */}
        {c.remMethod?.val && (
          <DetailItem title="记忆方法">
            <p className="text-gray-700">{c.remMethod.val}</p>
          </DetailItem>
        )}
      </main>
    </div>
  );
}

function PronounceBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-14 items-center justify-center gap-1 rounded-full bg-indigo-50 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
    >
      🔊 {label}
    </button>
  );
}

function DetailItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <h3 className="mb-2 text-sm font-medium text-gray-500">── {title} ──</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-2xl font-semibold text-gray-900">未找到该单词</p>
      <button
        onClick={onBack}
        className="mt-2 h-11 rounded-full bg-indigo-600 px-6 text-sm font-medium text-white"
      >
        返回
      </button>
    </div>
  );
}