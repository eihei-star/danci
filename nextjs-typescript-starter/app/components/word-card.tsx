'use client';

import type { WordRow } from 'app/lib/mock-data';

export function WordCard({
  word,
  onOpenDetail,
  onNext,
  isLast,
}: {
  word: WordRow;
  onOpenDetail: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const c = word.content.word.content;
  const phone = c.ukphone || c.usphone;
  const trans = c.trans?.[0];
  const sentence = c.sentence?.sentences?.[0];

  return (
    <div className="flex flex-1 flex-col">
      {/* 卡片主体 + 例句：整块可点击进入详情页 */}
      <button
        onClick={onOpenDetail}
        className="flex flex-1 flex-col text-left"
      >
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-3xl font-bold text-gray-900">{word.headWord}</p>
          {phone && <p className="mt-2 text-base text-gray-500">{phone}</p>}
          {trans?.tranCn && (
            <p className="mt-3 text-2xl font-semibold text-indigo-600">
              {trans.tranCn}
            </p>
          )}
        </div>

        {sentence && (
          <div className="mt-3 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-gray-100">
            <p className="font-medium text-gray-500">例句</p>
            <p className="mt-1.5 text-gray-900">{sentence.sContent}</p>
            {sentence.sCn && <p className="mt-1 text-gray-400">{sentence.sCn}</p>}
          </div>
        )}
      </button>

      <div className="mt-4">
        <button
          onClick={onNext}
          className="h-12 w-full rounded-full bg-indigo-600 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          {isLast ? '完成学习' : '下一个  →'}
        </button>
      </div>
    </div>
  );
}