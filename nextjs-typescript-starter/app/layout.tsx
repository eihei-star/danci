import './globals.css';

import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Providers } from 'app/components/providers';

export const metadata: Metadata = {
  title: '背诵单词',
  description: '手机端 H5 背单词应用：浏览单词书、学习单词、记录学习进度',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={GeistSans.variable}>
        <Providers>
          <div className="mx-auto min-h-screen max-w-md bg-gray-50 shadow-sm">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}