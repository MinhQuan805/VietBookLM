// app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const nav = [
  { name: 'Trang chủ', link: '/' },
  { name: 'Bài viết', link: '/article' },
  { name: 'Sản phẩm', link: '/product' },
];
const navItems = nav.map((item) => ({
  key: item.link,
  label: <Link href={item.link}>{item.name}</Link>,
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}